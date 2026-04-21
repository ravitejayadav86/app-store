from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import models, schemas, auth
from database import get_db
import asyncio
from realtime import manager

router = APIRouter(prefix="/community", tags=["community"])

def build_post(p, db, current_user=None):
    author = db.query(models.User).filter(models.User.id == p.user_id).first()
    likes_count = db.query(models.PostLike).filter(models.PostLike.post_id == p.id).count()
    liked_by_me = False
    if current_user:
        liked_by_me = db.query(models.PostLike).filter(
            models.PostLike.post_id == p.id,
            models.PostLike.user_id == current_user.id
        ).first() is not None
    replies = []
    for r in p.replies:
        replier = db.query(models.User).filter(models.User.id == r.user_id).first()
        replies.append({
            "id": r.id,
            "user_id": r.user_id,
            "post_id": r.post_id,
            "content": r.content,
            "created_at": r.created_at,
            "username": replier.username if replier else "Deleted",
            "avatar_url": replier.avatar_url if replier else None
        })
    return {
        "id": p.id,
        "user_id": p.user_id,
        "content": p.content,
        "created_at": p.created_at,
        "username": author.username if author else "Deleted",
        "avatar_url": author.avatar_url if author else None,
        "likes_count": likes_count,
        "liked_by_me": liked_by_me,
        "replies": replies
    }

@router.get("/posts")
def get_posts(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    posts = db.query(models.Post).order_by(models.Post.created_at.desc()).all()
    return [build_post(p, db, current_user) for p in posts]

@router.post("/posts")
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not post.content.strip():
        raise HTTPException(400, "Content cannot be empty")
    new_post = models.Post(user_id=current_user.id, content=post.content)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    data = build_post(new_post, db, current_user)
    # Broadcast to everyone
    asyncio.create_task(manager.broadcast({
        "type": "NEW_POST",
        "post": data
    }))
    return data

@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    if post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Not authorized")
    db.delete(post)
    db.commit()
    return {"message": "Deleted"}

@router.post("/posts/{post_id}/like")
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    existing = db.query(models.PostLike).filter(
        models.PostLike.user_id == current_user.id,
        models.PostLike.post_id == post_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False}
    like = models.PostLike(user_id=current_user.id, post_id=post_id)
    db.add(like)
    db.commit()
    return {"liked": True}

@router.post("/posts/{post_id}/replies")
def add_reply(
    post_id: int,
    reply: schemas.ReplyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    new_reply = models.PostReply(
        user_id=current_user.id,
        post_id=post_id,
        content=reply.content
    )
    db.add(new_reply)
    
    # Send Notification to Post Author if they are NOT the replier
    if post.user_id != current_user.id:
        notif = models.Notification(
            user_id=post.user_id,
            title="New Reply",
            message=f"@{current_user.username} replied to your post!"
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        asyncio.create_task(manager.send_to_user(post.user_id, {
            "type": "NOTIFICATION",
            "id": notif.id,
            "title": notif.title,
            "message": notif.message,
            "created_at": notif.created_at.isoformat()
        }))
    else:
        db.commit()
        db.refresh(new_reply)
        
    data = {
        "id": new_reply.id,
        "user_id": new_reply.user_id,
        "post_id": new_reply.post_id,
        "content": new_reply.content,
        "created_at": new_reply.created_at,
        "username": current_user.username,
        "avatar_url": current_user.avatar_url
    }
    
    # Broadcast to everyone
    asyncio.create_task(manager.broadcast({
        "type": "NEW_REPLY",
        "reply": data
    }))
    
    return data

@router.delete("/replies/{reply_id}")
def delete_reply(
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    reply = db.query(models.PostReply).filter(models.PostReply.id == reply_id).first()
    if not reply:
        raise HTTPException(404, "Reply not found")
    if reply.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "Not authorized")
    db.delete(reply)
    db.commit()
    return {"message": "Deleted"}