from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/community", tags=["community"])

@router.get("", response_model=List[schemas.PostOut])
def get_posts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_optional_user)
):
    posts = db.query(models.Post).order_by(models.Post.created_at.desc()).all()
    result = []
    for p in posts:
        # Get post author
        author = db.query(models.User).filter(models.User.id == p.user_id).first()
        
        # Get likes
        likes_count = db.query(models.PostLike).filter(models.PostLike.post_id == p.id).count()
        liked_by_me = False
        if current_user:
            liked_by_me = db.query(models.PostLike).filter(
                models.PostLike.post_id == p.id,
                models.PostLike.user_id == current_user.id
            ).first() is not None
        
        # Get replies
        replies = []
        for r in p.replies:
            replier = db.query(models.User).filter(models.User.id == r.user_id).first()
            replies.append({
                "id": r.id,
                "user_id": r.user_id,
                "post_id": r.post_id,
                "content": r.content,
                "created_at": r.created_at,
                "username": replier.username if replier else "Deleted User"
            })
            
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "content": p.content,
            "created_at": p.created_at,
            "username": author.username if author else "Deleted User",
            "likes_count": likes_count,
            "liked_by_me": liked_by_me,
            "replies": replies
        })
    return result

@router.post("", response_model=schemas.PostOut)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_post = models.Post(
        user_id=current_user.id,
        content=post.content
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return {
        "id": new_post.id,
        "user_id": new_post.user_id,
        "content": new_post.content,
        "created_at": new_post.created_at,
        "username": current_user.username,
        "likes_count": 0,
        "liked_by_me": False,
        "replies": []
    }

@router.post("/like/{post_id}")
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
    else:
        like = models.PostLike(user_id=current_user.id, post_id=post_id)
        db.add(like)
        db.commit()
        return {"liked": True}

@router.post("/reply/{post_id}")
def reply_to_post(
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
    db.commit()
    db.refresh(new_reply)
    
    return {
        "id": new_reply.id,
        "user_id": new_reply.user_id,
        "post_id": new_reply.post_id,
        "content": new_reply.content,
        "created_at": new_reply.created_at,
        "username": current_user.username
    }
