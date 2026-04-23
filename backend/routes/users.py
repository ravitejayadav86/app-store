from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="deii8hxll",
    api_key="976199473967583",
    api_secret="hmjlrH1hSjKTOHQw4r5TElfdUNE"
)
import os
from dotenv import load_dotenv

load_dotenv()

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    """Get current logged in user details."""
    return current_user

@router.put("/me", response_model=schemas.UserOut)
def update_me(
    data: schemas.UpdateProfile,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update current user profile information."""
    update_data = data.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/me/stats", response_model=schemas.UserStats)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get statistics for the current user."""
    installs = db.query(models.Purchase).filter(
        models.Purchase.user_id == current_user.id
    ).count()
    
    published = db.query(models.App).filter(
        models.App.developer == current_user.username
    ).count()
    
    reviews = db.query(models.Review).filter(
        models.Review.user_id == current_user.id
    ).count()
    
    followers = db.query(models.Follow).filter(
        models.Follow.following_id == current_user.id,
        models.Follow.is_accepted == True
    ).count()
    
    following = db.query(models.Follow).filter(
        models.Follow.follower_id == current_user.id,
        models.Follow.is_accepted == True
    ).count()
    
    return {
        "installs": installs,
        "published": published,
        "reviews": reviews,
        "followers": followers,
        "following": following
    }

@router.post("/me/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Upload or update user avatar."""
    try:
        result = cloudinary.uploader.upload(
            file.file,
            resource_type="image",
            folder="pandastore/avatars",
            public_id=f"user_{current_user.id}",
            overwrite=True,
            transformation=[{"width": 200, "height": 200, "crop": "fill"}]
        )
        current_user.avatar_url = result["secure_url"]
        db.commit()
        return {"avatar_url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/me/purchases", response_model=List[schemas.PurchaseOut])
def my_purchases(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get list of apps purchased by the user."""
    from sqlalchemy.orm import joinedload
    return db.query(models.Purchase).options(
        joinedload(models.Purchase.app)
    ).filter(models.Purchase.user_id == current_user.id).all()

@router.get("/me/submissions", response_model=List[schemas.AppOut])
def my_submissions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get list of apps submitted by the user."""
    return db.query(models.App).filter(
        models.App.developer == current_user.username
    ).all()

@router.post("/me/verify-publisher", response_model=schemas.MessageResponse)
def verify_publisher(
    data: Optional[schemas.UpdateProfile] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Upgrade user to publisher status."""
    try:
        current_user.is_publisher = True
        if data:
            update_data = data.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(current_user, key, value)
        
        db.commit()
        db.refresh(current_user)
        return {"message": "Success! You are now a verified publisher."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
