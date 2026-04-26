from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import os
import time
import cloudinary
import cloudinary.uploader
import logging

from realtime import manager

logger = logging.getLogger(__name__)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/search")
def search_users(q: str, db: Session = Depends(get_db)):
    if not q:
        return []
    
    # Strip leading @ if present
    query = q.strip()
    if query.startswith("@"):
        query = query[1:]
        
    if len(query) < 2:
        return []
        
    # Tier 1: Exact Match
    exact_users = db.query(models.User).filter(
        (models.User.username.ilike(query)) |
        (models.User.full_name.ilike(query))
    ).all()
    
    # Tier 2: Prefix Match
    prefix_users = db.query(models.User).filter(
        (models.User.username.ilike(f"{query}%")) |
        (models.User.full_name.ilike(f"{query}%"))
    ).all()
    
    # Tier 3: Contains Match (including bio)
    contains_users = db.query(models.User).filter(
        (models.User.username.ilike(f"%{query}%")) |
        (models.User.full_name.ilike(f"%{query}%")) |
        (models.User.bio.ilike(f"%{query}%"))
    ).all()
    
    seen = set()
    result_users = []
    
    for group in [exact_users, prefix_users, contains_users]:
        for u in group:
            if u.id not in seen:
                seen.add(u.id)
                result_users.append(u)
            if len(result_users) >= 15:
                break
        if len(result_users) >= 15:
            break
            
    return [{"id": u.id, "username": u.username, "full_name": u.full_name, "bio": u.bio, "is_private": u.is_private, "avatar_url": u.avatar_url} for u in result_users]

@router.get("/profile/{username}")
def get_profile(
    username: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    
    followers_count = db.query(models.Follow).filter(models.Follow.following_id == user.id, models.Follow.is_accepted == True).count()
    following_count = db.query(models.Follow).filter(models.Follow.follower_id == user.id, models.Follow.is_accepted == True).count()
    installs_count = db.query(models.Purchase).filter(models.Purchase.user_id == user.id).count()
    reviews_count = db.query(models.Review).filter(models.Review.user_id == user.id).count()
    
    is_following = False
    
    if current_user:
        is_following = db.query(models.Follow).filter(
            models.Follow.follower_id == current_user.id,
            models.Follow.following_id == user.id,
            models.Follow.is_accepted == True
        ).first() is not None

    apps = db.query(models.App).filter(models.App.developer == user.username).all()

    posts = []
    if not user.is_private or is_following or (current_user and current_user.id == user.id):
        raw_posts = db.query(models.Post).filter(models.Post.user_id == user.id).order_by(models.Post.created_at.desc()).all()
        for p in raw_posts:
            likes_count = db.query(models.PostLike).filter(models.PostLike.post_id == p.id).count()
            liked_by_me = False
            if current_user:
                liked_by_me = db.query(models.PostLike).filter(
                    models.PostLike.post_id == p.id,
                    models.PostLike.user_id == current_user.id
                ).first() is not None
            
            # Simple reply hydration
            replies = []
            for r in p.replies:
                replies.append({
                    "id": r.id,
                    "user_id": r.user_id,
                    "post_id": r.post_id,
                    "content": r.content,
                    "created_at": r.created_at,
                    "username": r.user.username,
                    "avatar_url": r.user.avatar_url
                })
            
            posts.append({
                "id": p.id,
                "user_id": p.user_id,
                "content": p.content,
                "created_at": p.created_at,
                "username": user.username,
                "avatar_url": user.avatar_url,
                "likes_count": likes_count,
                "liked_by_me": liked_by_me,
                "replies": replies
            })

    return {
        "id": user.id,
        "username": user.username,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "is_private": user.is_private,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "followers_count": followers_count,
        "following_count": following_count,
        "installs_count": installs_count,
        "reviews_count": reviews_count,
        "is_following": is_following,
        "apps": [{"id": a.id, "name": a.name, "category": a.category, "price": a.price, "version": a.version, "description": a.description, "developer": a.developer, "is_active": a.is_active, "is_approved": a.is_approved, "file_path": a.file_path, "icon_url": a.icon_url, "screenshot_urls": a.screenshot_urls, "created_at": a.created_at} for a in apps],
        "posts": posts
    }

@router.post("/follow/{username}")
async def toggle_follow(
    username: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.id == current_user.id:
        raise HTTPException(400, "Cannot follow yourself")
    
    existing = db.query(models.Follow).filter(
        models.Follow.follower_id == current_user.id,
        models.Follow.following_id == user.id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"following": False, "status": "unfollowed"}
    else:
        is_accepted = not user.is_private
        follow = models.Follow(follower_id=current_user.id, following_id=user.id, is_accepted=is_accepted)
        db.add(follow)
        
        # Real-time Notification
        title = "New Follower" if is_accepted else "Follow Request"
        msg_text = f"@{current_user.username} started following you!" if is_accepted else f"@{current_user.username} sent you a follow request."
        
        notif = models.Notification(
            user_id=user.id,
            title=title,
            message=msg_text
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        
        # Push via WebSocket
        background_tasks.add_task(manager.send_to_user, user.id, {
            "type": "NOTIFICATION",
            "id": notif.id,
            "title": notif.title,
            "message": notif.message,
            "created_at": notif.created_at.isoformat()
        })
        
        return {"following": is_accepted, "status": "following" if is_accepted else "requested"}

@router.patch("/profile")
def update_profile(
    data: schemas.UpdateProfile,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if data.bio is not None:
        current_user.bio = data.bio
    if data.is_private is not None:
        current_user.is_private = data.is_private
    if data.public_key is not None:
        current_user.public_key = data.public_key
    if data.billing_address is not None:
        current_user.billing_address = data.billing_address
    if data.payment_method is not None:
        current_user.payment_method = data.payment_method
    if data.biometric_enabled is not None:
        current_user.biometric_enabled = data.biometric_enabled
    if data.safe_browsing is not None:
        current_user.safe_browsing = data.safe_browsing
    if data.auto_update is not None:
        current_user.auto_update = data.auto_update
    if data.download_pref is not None:
        current_user.download_pref = data.download_pref
    db.commit()
    return {"message": "Profile updated"}

@router.get("/followers/me")
def get_my_followers(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    follows = db.query(models.Follow).filter(models.Follow.following_id == current_user.id, models.Follow.is_accepted == True).all()
    result = []
    for f in follows:
        u = db.query(models.User).filter(models.User.id == f.follower_id).first()
        if u:
            result.append({"id": u.id, "username": u.username, "bio": u.bio, "avatar_url": u.avatar_url, "full_name": u.full_name})
    return result

@router.get("/following/me")
def get_my_following(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    follows = db.query(models.Follow).filter(models.Follow.follower_id == current_user.id, models.Follow.is_accepted == True).all()
    result = []
    for f in follows:
        u = db.query(models.User).filter(models.User.id == f.following_id).first()
        if u:
            result.append({"id": u.id, "username": u.username, "bio": u.bio, "avatar_url": u.avatar_url, "full_name": u.full_name})
    return result

@router.get("/requests/pending")
def get_pending_requests(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    requests = db.query(models.Follow).filter(models.Follow.following_id == current_user.id, models.Follow.is_accepted == False).all()
    result = []
    for r in requests:
        u = db.query(models.User).filter(models.User.id == r.follower_id).first()
        if u:
            result.append({"id": u.id, "username": u.username, "bio": u.bio, "avatar_url": u.avatar_url, "full_name": u.full_name})
    return result

@router.get("/followers/{username}")
def get_followers(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    follows = db.query(models.Follow).filter(models.Follow.following_id == user.id, models.Follow.is_accepted == True).all()
    result = []
    for f in follows:
        u = db.query(models.User).filter(models.User.id == f.follower_id).first()
        if u:
            result.append({"id": u.id, "username": u.username, "bio": u.bio, "avatar_url": u.avatar_url, "full_name": u.full_name})
    return result

@router.get("/following/{username}")
def get_following(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    follows = db.query(models.Follow).filter(models.Follow.follower_id == user.id, models.Follow.is_accepted == True).all()
    result = []
    for f in follows:
        u = db.query(models.User).filter(models.User.id == f.following_id).first()
        if u:
            result.append({"id": u.id, "username": u.username, "bio": u.bio, "avatar_url": u.avatar_url, "full_name": u.full_name})
    return result

@router.post("/support/feedback")
def send_support_feedback(
    data: schemas.MessageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Send feedback to all admins."""
    admins = db.query(models.User).filter(models.User.is_admin == True).all()
    if not admins:
        # Fallback: if no admin is marked, notify the developer or just log it
        return {"message": "Feedback received. Our team will review it."}

    for admin in admins:
        # Create persistent notification
        notif = models.Notification(
            user_id=admin.id,
            title=f"Support Feedback from @{current_user.username}",
            message=data.content
        )
        db.add(notif)
        
        # Real-time WebSocket notification
        background_tasks.add_task(manager.send_to_user, admin.id, {
            "type": "NOTIFICATION",
            "title": "New Support Feedback",
            "message": f"@{current_user.username}: {data.content[:50]}...",
            "from": current_user.username
        })

    db.commit()
    return {"message": "Thank you! Your feedback has been sent to our admin team."}

# -- Messages --
@router.post("/messages/{username}/read")
async def mark_read(
    username: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    other = db.query(models.User).filter(models.User.username == username).first()
    if not other:
        raise HTTPException(404, "User not found")
    
    db.query(models.Message).filter(
        models.Message.sender_id == other.id,
        models.Message.receiver_id == current_user.id,
        models.Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    
    # Notify sender that their messages were read
    background_tasks.add_task(manager.send_to_user, other.id, {
        "type": "MESSAGES_READ",
        "by": current_user.username
    })
    
    return {"status": "ok"}

@router.post("/follow/accept/{follower_id}")
async def accept_follow_request(
    follower_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    follow = db.query(models.Follow).filter(
        models.Follow.follower_id == follower_id,
        models.Follow.following_id == current_user.id,
        models.Follow.is_accepted == False
    ).first()
    
    if not follow:
        raise HTTPException(404, "Follow request not found")
    
    follow.is_accepted = True
    
    # Notify follower
    notif = models.Notification(
        user_id=follower_id,
        title="Request Accepted",
        message=f"@{current_user.username} accepted your follow request!"
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    # WebSocket
    background_tasks.add_task(manager.send_to_user, follower_id, {
        "type": "NOTIFICATION",
        "id": notif.id,
        "title": notif.title,
        "message": notif.message,
        "created_at": notif.created_at.isoformat()
    })
    
    return {"status": "accepted"}

@router.post("/messages/{username}")
async def send_message(
    username: str,
    msg: schemas.MessageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    receiver = db.query(models.User).filter(models.User.username == username).first()
    if not receiver:
        raise HTTPException(404, "User not found")
    message = models.Message(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        content=msg.content,
        media_url=msg.media_url,
        media_type=msg.media_type
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    payload = {
        "id": message.id, 
        "content": message.content, 
        "media_url": message.media_url,
        "media_type": message.media_type,
        "created_at": message.created_at.isoformat(), 
        "sender_username": current_user.username, 
        "sender_avatar_url": current_user.avatar_url,
        "sender_id": current_user.id,
        "receiver_id": receiver.id,
        "is_read": False
    }

    # Persistent Notification
    notif = models.Notification(
        user_id=receiver.id,
        title="New Message",
        message=f"@{current_user.username} sent you a message."
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    # Notify via WebSocket if possible
    background_tasks.add_task(manager.send_to_user, receiver.id, payload)
    # Also notify about the new notification entry
    background_tasks.add_task(manager.send_to_user, receiver.id, {
        "type": "NOTIFICATION",
        "id": notif.id,
        "title": notif.title,
        "message": notif.message,
        "created_at": notif.created_at.isoformat()
    })
    
    return payload

@router.post("/messages/{username}/upload")
def upload_chat_file(
    username: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    import cloudinary.uploader
    import re
    def sanitize_id(filename: str) -> str:
        return re.sub(r'[^a-zA-Z0-9.\-_]', '_', filename)
    
    receiver = db.query(models.User).filter(models.User.username == username).first()
    if not receiver:
        raise HTTPException(404, "User not found")
        
    # Determine resource type based on file extension or mime type
    content_type = file.content_type or ""
    filename = file.filename or "file"
    
    if content_type.startswith("image/"):
        res_type = "image"
    elif content_type.startswith("video/"):
        res_type = "video"
    else:
        res_type = "raw"
        
    try:
        # Check file size for large upload strategy
        try:
            file.file.seek(0, os.SEEK_END)
            file_size = file.file.tell()
            file.file.seek(0)
            print(f"Uploading file: {filename} ({file_size} bytes)")
        except Exception as e:
            print(f"Error checking file size: {e}")
            file_size = 0
        
        upload_params = {
            "resource_type": res_type,
            "folder": f"pandastore/chat/{current_user.username}",
            "public_id": f"msg_{sanitize_id(filename)}",
            "quality": "auto",
            "fetch_format": "auto",
            "flags": "attachment" if res_type == "raw" else None
        }

        try:
            if file_size > 20 * 1024 * 1024: # Use chunked upload for > 20MB
                print(f"Using upload_large for {filename}")
                result = cloudinary.uploader.upload_large(
                    file.file,
                    chunk_size=6000000, # 6MB chunks
                    **upload_params
                )
            else:
                result = cloudinary.uploader.upload(
                    file.file,
                    **upload_params
                )
            
            print(f"Cloudinary upload success: {result.get('secure_url')}")
            return {
                "media_url": result["secure_url"],
                "media_type": res_type
            }
        except Exception as cloud_err:
            print(f"Cloudinary upload failed: {cloud_err}")
            # Fallback to local storage
            import shutil
            import os
            os.makedirs("uploads/chat", exist_ok=True)
            safe_name = sanitize_id(filename)
            # Add timestamp to avoid collisions
            local_name = f"msg_{current_user.id}_{int(time.time())}_{safe_name}"
            local_path = f"uploads/chat/{local_name}"
            
            file.file.seek(0)
            with open(local_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            print(f"Fallback to local storage success: {local_path}")
            return {
                "media_url": f"/{local_path}",
                "media_type": res_type
            }
    except Exception as final_err:
        print(f"Critical upload error: {final_err}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(final_err)}")

@router.get("/messages/{username}")
def get_messages(
    username: str,
    limit: int = 50,
    before_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    other = db.query(models.User).filter(models.User.username == username).first()
    if not other:
        raise HTTPException(404, "User not found")
    
    query = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == other.id)) |
        ((models.Message.sender_id == other.id) & (models.Message.receiver_id == current_user.id))
    )
    
    if before_id:
        query = query.filter(models.Message.id < before_id)
        
    messages = query.order_by(models.Message.id.desc()).limit(limit).all()
    
    # Return reversed because we want chronological order in the UI
    result = []
    for m in reversed(messages):
        result.append({
            "id": m.id,
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "content": m.content,
            "media_url": m.media_url,
            "media_type": m.media_type,
            "is_read": m.is_read,
            "created_at": m.created_at,
            "sender_username": m.sender.username if m.sender else "Unknown",
            "sender_avatar_url": m.sender.avatar_url if m.sender else None
        })
    return result

@router.get("/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Use a more efficient query to get conversations with user details joined
    from sqlalchemy import or_, and_, desc, func
    
    # Subquery to get the latest message ID for each conversation partner
    subquery = db.query(
        func.max(models.Message.id).label("max_id")
    ).filter(
        or_(
            models.Message.sender_id == current_user.id,
            models.Message.receiver_id == current_user.id
        )
    ).group_by(
        func.case(
            (models.Message.sender_id == current_user.id, models.Message.receiver_id),
            else_=models.Message.sender_id
        )
    ).subquery()

    latest_messages = db.query(models.Message).filter(
        models.Message.id.in_(subquery)
    ).order_by(models.Message.created_at.desc()).all()

    conversations = []
    for m in latest_messages:
        other_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
        other = db.query(models.User).filter(models.User.id == other_id).first()
        
        if other:
            # Count unread messages from this user
            unread_count = db.query(models.Message).filter(
                models.Message.sender_id == other_id,
                models.Message.receiver_id == current_user.id,
                models.Message.is_read == False
            ).count()
            
            conversations.append({
                "username": other.username,
                "avatar_url": other.avatar_url,
                "last_message": m.content,
                "created_at": m.created_at,
                "is_read": m.is_read or m.sender_id == current_user.id,
                "unread_count": unread_count
            })
    return conversations

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    db: Session = Depends(get_db)
):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()

            # Per-message error isolation — a bad payload won't kill the connection
            try:
                msg_data = json.loads(data)
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from user {user_id}: {data[:80]}")
                continue

            msg_type = msg_data.get("type", "MESSAGE")

            # Handle ping/pong keepalive
            if msg_type == "PING":
                await websocket.send_text(json.dumps({"type": "PONG"}))
                continue

            if msg_type == "READ":
                try:
                    other_username = msg_data.get("to")
                    other = db.query(models.User).filter(models.User.username == other_username).first()
                    if other:
                        db.query(models.Message).filter(
                            models.Message.sender_id == other.id,
                            models.Message.receiver_id == user_id,
                            models.Message.is_read == False
                        ).update({"is_read": True})
                        db.commit()
                        await manager.send_to_user(other.id, {
                            "type": "MESSAGES_READ",
                            "by_id": user_id
                        })
                except Exception as e:
                    logger.error(f"WS READ error for user {user_id}: {e}")
                    db.rollback()
                continue

            try:
                receiver = db.query(models.User).filter(
                    models.User.username == msg_data.get("to")
                ).first()

                if receiver:
                    sender = db.query(models.User).filter(
                        models.User.id == user_id
                    ).first()

                    message = models.Message(
                        sender_id=user_id,
                        receiver_id=receiver.id,
                        content=msg_data.get("content", ""),
                        media_url=msg_data.get("media_url"),
                        media_type=msg_data.get("media_type")
                    )
                    db.add(message)
                    db.commit()
                    db.refresh(message)

                    # Persistent Notification for the receiver
                    notif = models.Notification(
                        user_id=receiver.id,
                        title="New Message",
                        message=f"@{sender.username if sender else 'Someone'} sent you a message."
                    )
                    db.add(notif)
                    db.commit()
                    db.refresh(notif)

                    payload = {
                        "type": "MESSAGE",
                        "id": message.id,
                        "sender_id": user_id,
                        "receiver_id": receiver.id,
                        "content": message.content,
                        "media_url": message.media_url,
                        "media_type": message.media_type,
                        "created_at": message.created_at.isoformat(),
                        "sender_username": sender.username if sender else "Unknown",
                        "sender_avatar_url": sender.avatar_url if sender else None,
                        "is_read": False
                    }

                    await manager.send_to_user(receiver.id, payload)
                    await manager.send_to_user(user_id, payload)

                    # Also notify about the new notification record
                    await manager.send_to_user(receiver.id, {
                        "type": "NOTIFICATION",
                        "id": notif.id,
                        "title": notif.title,
                        "message": notif.message,
                        "created_at": notif.created_at.isoformat()
                    })

            except Exception as e:
                logger.error(f"WS MESSAGE error for user {user_id}: {e}")
                db.rollback()

    except WebSocketDisconnect:
        logger.info(f"WS normal disconnect: user_id={user_id}")
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WS fatal error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)
