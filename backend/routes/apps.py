from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db
import os, cloudinary, cloudinary.uploader

cloudinary.config(
    cloud_name="deii8hxll",
    api_key="976199473967583",
    api_secret="hmjlrH1hSjKTOHQw4r5TElfdUNE"
)

router = APIRouter(prefix="/apps", tags=["apps"])

@router.get("/", response_model=List[schemas.AppOut])
def get_apps(db: Session = Depends(get_db)):
    return db.query(models.App).filter(
        models.App.is_approved == True,
        models.App.is_active == True
    ).all()

@router.get("/me", response_model=List[schemas.AppOut])
def get_my_apps(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.App).filter(models.App.developer == current_user.username).all()

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    my_apps = db.query(models.App).filter(models.App.developer == current_user.username).all()
    app_ids = [a.id for a in my_apps]
    total_apps = len(my_apps)
    approved = sum(1 for a in my_apps if a.is_approved)
    pending = total_apps - approved
    downloads = db.query(models.Purchase).filter(models.Purchase.app_id.in_(app_ids)).count() if app_ids else 0
    return {
        "total_apps": total_apps,
        "approved": approved,
        "pending": pending,
        "total_downloads": downloads,
    }

@router.post("/submit", response_model=schemas.AppOut, status_code=201)
def submit_app(
    app: schemas.AppCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_app = models.App(
        name=app.name,
        description=app.description,
        price=app.price,
        category=app.category,
        version=app.version,
        developer=current_user.username,
        is_active=True,
        is_approved=True
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

@router.post("/{app_id}/upload")
def upload_file(
    app_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    app = db.query(models.App).filter(
        models.App.id == app_id,
        models.App.developer == current_user.username
    ).first()
    if not app:
        raise HTTPException(404, "App not found")

    # Upload to Cloudinary
    result = cloudinary.uploader.upload(
        file.file,
        resource_type="raw",
        folder="pandastore",
        public_id=f"app_{app_id}_{file.filename}"
    )

    # Save Cloudinary URL to database
    app.file_path = result["secure_url"]
    db.commit()
    return {"message": "File uploaded", "file_path": result["secure_url"]}

@router.get("/{app_id}/download")
def download_file(
    app_id: int,
    db: Session = Depends(get_db)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app or not app.file_path:
        raise HTTPException(404, "No file uploaded for this app.")
    # Redirect to Cloudinary URL directly
    return RedirectResponse(url=app.file_path)

@router.post("/{app_id}/grant")
def grant_access(
    app_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    username = payload.get("username")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    existing = db.query(models.Purchase).filter(
        models.Purchase.user_id == user.id,
        models.Purchase.app_id == app_id
    ).first()
    if not existing:
        purchase = models.Purchase(user_id=user.id, app_id=app_id)
        db.add(purchase)
        db.commit()
    return {"message": f"Access granted to {username}"}

@router.get("/{app_id}", response_model=schemas.AppOut)
def get_app(app_id: int, db: Session = Depends(get_db)):
    app = db.query(models.App).filter(
        models.App.id == app_id,
        models.App.is_active == True
    ).first()
    if not app:
        raise HTTPException(404, "App not found or has been removed")
    return app

@router.delete("/{app_id}")
def delete_app(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app:
        raise HTTPException(404, "App not found")
    if app.developer != current_user.username and not current_user.is_admin:
        raise HTTPException(403, "Not authorized to delete this app")
    if app.file_path and app.file_path.startswith("http"):
        try:
            public_id = app.file_path.split("/")[-1].split(".")[0]
            cloudinary.uploader.destroy(f"pandastore/{public_id}", resource_type="raw")
        except Exception as e:
            print(f"Error deleting from Cloudinary: {e}")
    db.query(models.Review).filter(models.Review.app_id == app_id).delete()
    db.query(models.Purchase).filter(models.Purchase.app_id == app_id).delete()
    db.delete(app)
    db.commit()
    return {"message": "App deleted successfully"}