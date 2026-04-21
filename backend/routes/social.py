from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

from realtime import manager

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
        
    users = db.query(models.User).filter(
        (models.User.username.ilike(f"%{query}%")) |
        (models.User.full_name.ilike(f"%{query}%"))
    ).limit(10).all()
    return [{"id": u.id, "username": u.username, "full_name": u.full_name, "bio": u.bio, "is_private": u.is_private, "avatar_url": u.avatar_url} for u in users]

@router.get("/profile/{username}")
def get_profile(
    username: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    
    followers_count = db.query(models.Follow).filter(models.Follow.following_id == user.id).count()
    following_count = db.query(models.Follow).filter(models.Follow.follower_id == user.id).count()
    is_following = False
    
    if current_user:
        is_following = db.query(models.Follow).filter(
            models.Follow.follower_id == current_user.id,
            models.Follow.following_id == user.id
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
        "is_following": is_following,
        "apps": [{"id": a.id, "name": a.name, "category": a.category, "price": a.price, "version": a.version, "description": a.description, "developer": a.developer, "is_active": a.is_active, "is_approved": a.is_approved, "file_path": a.file_path, "created_at": a.created_at} for a in apps],
        "posts": posts
    }

@router.post("/follow/{username}")
def toggle_follow(
    username: str,
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
        return {"following": False}
    else:
        follow = models.Follow(follower_id=current_user.id, following_id=user.id)
        db.add(follow)
        
        # Real-time Notification
        notif = models.Notification(
            user_id=user.id,
            title="New Follower",
            message=f"@{current_user.username} started following you!"
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        
        # Push via WebSocket
        import asyncio
        asyncio.create_task(manager.send_to_user(user.id, {
            "type": "NOTIFICATION",
            "id": notif.id,
            "title": notif.title,
            "message": notif.message,
            "created_at": notif.created_at.isoformat()
        }))
        
        return {"following": True}

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

@router.get("/followers/{username}")
def get_followers(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    follows = db.query(models.Follow).filter(models.Follow.following_id == user.id).all()
    result = []
    for f in follows:
        u = db.query(models.User).filter(models.User.id == f.follower_id).first()
        if u:
            result.append({"id": u.id, "username": u.username, "bio": u.bio})
    return result

@router.get("/following/{username}")
def get_following(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    follows = db.query(models.Follow).filter(models.Follow.follower_id == user.id).all()
    result = []
    for f in follows:
        u = db.query(models.User).filter(models.User.id == f.following_id).first()
        if u:
            result.append({"id": u.id, "username": u.username, "bio": u.bio})
    return result

# -- Messages --
@router.post("/messages/{username}/read")
def mark_read(
    username: str,
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
    import asyncio
    asyncio.create_task(manager.send_to_user(other.id, {
        "type": "MESSAGES_READ",
        "by": current_user.username
    }))
    
    return {"status": "ok"}

@router.post("/messages/{username}")
def send_message(
    username: str,
    msg: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    receiver = db.query(models.User).filter(models.User.username == username).first()
    if not receiver:
        raise HTTPException(404, "User not found")
    message = models.Message(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        content=msg.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    payload = {
        "id": message.id, 
        "content": message.content, 
        "created_at": message.created_at.isoformat(), 
        "sender_username": current_user.username, 
        "sender_avatar_url": current_user.avatar_url,
        "sender_id": current_user.id,
        "receiver_id": receiver.id,
        "is_read": False
    }
    
    # Notify via WebSocket if possible
    import asyncio
    asyncio.create_task(manager.send_to_user(receiver.id, payload))
    
    return payload

@router.get("/messages/{username}")
def get_messages(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    other = db.query(models.User).filter(models.User.username == username).first()
    if not other:
        raise HTTPException(404, "User not found")
    messages = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == other.id)) |
        ((models.Message.sender_id == other.id) & (models.Message.receiver_id == current_user.id))
    ).order_by(models.Message.created_at.asc()).all()
    
    result = []
    for m in messages:
        result.append({
            "id": m.id,
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "content": m.content,
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
    # Use a more efficient query to get last messages
    messages = db.query(models.Message).filter(
        (models.Message.sender_id == current_user.id) |
        (models.Message.receiver_id == current_user.id)
    ).order_by(models.Message.created_at.desc()).all()
    
    seen = set()
    conversations = []
    for m in messages:
        other_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
        if other_id not in seen:
            seen.add(other_id)
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
            msg_data = json.loads(data)
            
            msg_type = msg_data.get("type", "MESSAGE")
            
            if msg_type == "READ":
                # Handle read confirmation
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
                continue

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
                    content=msg_data.get("content", "")
                )
                db.add(message)
                db.commit()
                db.refresh(message)
                
                payload = {
                    "id": message.id,
                    "sender_id": user_id,
                    "receiver_id": receiver.id,
                    "content": message.content,
                    "created_at": message.created_at.isoformat(),
                    "sender_username": sender.username if sender else "Unknown",
                    "sender_avatar_url": sender.avatar_url if sender else None,
                    "is_read": False
                }
                
                await manager.send_to_user(receiver.id, payload)
                await manager.send_to_user(user_id, payload)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WS Error: {e}")
        manager.disconnect(websocket, user_id)