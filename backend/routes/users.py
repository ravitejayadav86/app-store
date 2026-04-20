from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="deii8hxll",
    api_key="976199473967583",
    api_secret="hmjlrH1hSjKTOHQw4r5TElfdUNE"
)

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/me")
def update_me(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if "full_name" in data:
        current_user.full_name = data["full_name"]
    if "bio" in data:
        current_user.bio = data["bio"]
    if "is_private" in data:
        current_user.is_private = data["is_private"]
    if "email" in data:
        current_user.email = data["email"]
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
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

@router.get("/me/purchases", response_model=List[schemas.PurchaseOut])
def my_purchases(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from sqlalchemy.orm import joinedload
    return db.query(models.Purchase).options(
        joinedload(models.Purchase.app)
    ).filter(models.Purchase.user_id == current_user.id).all()

@router.get("/me/submissions", response_model=List[schemas.AppOut])
def my_submissions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.App).filter(
        models.App.developer == current_user.username
    ).all()