from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)

    async def send_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_text(json.dumps(message))
                except:
                    pass

manager = ConnectionManager()

router = APIRouter(prefix="/social", tags=["social"])

@router.get("/search")
def search_users(q: str, db: Session = Depends(get_db)):
    if not q or len(q) < 2:
        return []
    users = db.query(models.User).filter(
        models.User.username.ilike(f"%{q}%")
    ).limit(10).all()
    return [{"id": u.id, "username": u.username, "bio": u.bio, "is_private": u.is_private} for u in users]

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

    apps = []
    if not user.is_private or is_following or (current_user and current_user.id == user.id):
        apps = db.query(models.App).filter(
            models.App.developer == user.username,
            models.App.is_approved == True,
            models.App.is_active == True
        ).all()

    return {
        "id": user.id,
        "username": user.username,
        "bio": user.bio,
        "is_private": user.is_private,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "followers_count": followers_count,
        "following_count": following_count,
        "is_following": is_following,
        "apps": [{"id": a.id, "name": a.name, "category": a.category, "price": a.price, "version": a.version, "description": a.description, "developer": a.developer, "is_active": a.is_active, "is_approved": a.is_approved, "file_path": a.file_path, "created_at": a.created_at} for a in apps]
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
        db.commit()
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
    return {"id": message.id, "content": message.content, "created_at": message.created_at, "sender_username": current_user.username}

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
        sender = db.query(models.User).filter(models.User.id == m.sender_id).first()
        result.append({
            "id": m.id,
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "content": m.content,
            "is_read": m.is_read,
            "created_at": m.created_at,
            "sender_username": sender.username if sender else "Unknown"
        })
    return result

@router.get("/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
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
                conversations.append({
                    "username": other.username,
                    "last_message": m.content,
                    "created_at": m.created_at,
                    "is_read": m.is_read
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
                    "sender_username": sender.username if sender else "Unknown"
                }
                
                await manager.send_to_user(receiver.id, payload)
                await manager.send_to_user(user_id, payload)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)