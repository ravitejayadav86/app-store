from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
import os, shutil, uuid

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
    app = db.query(models.App).filter(models.App.id == app_id, models.App.developer == current_user.username).first()
    if not app:
        raise HTTPException(404, "App not found")
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{uuid.uuid4()}_{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    app.file_path = file_path
    db.commit()
    return {"message": "File uploaded", "file_path": file_path}

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

@router.get("/{app_id}/download")
def download_file(
    app_id: int,
    db: Session = Depends(get_db)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app or not app.file_path:
        raise HTTPException(404, "Download record not found for this app.")
    
    # Check if the physical file exists on disk
    if not os.path.exists(app.file_path):
        raise HTTPException(
            status_code=404, 
            detail="The app file was not found on the server's storage. It may have been removed or lost during a server restart. Please contact the publisher to re-upload."
        )
        
    return FileResponse(
        app.file_path,
        filename=os.path.basename(app.file_path),
        media_type="application/octet-stream"
    )

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
    
    # Check if user is owner or admin
    if app.developer != current_user.username and not current_user.is_admin:
        raise HTTPException(403, "Not authorized to delete this app")
    
    # Delete file from filesystem if it exists
    if app.file_path and os.path.exists(app.file_path):
        try:
            os.remove(app.file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    # Delete associated records (Reviews and Purchases)
    db.query(models.Review).filter(models.Review.app_id == app_id).delete()
    db.query(models.Purchase).filter(models.Purchase.app_id == app_id).delete()
    
    # Delete the app record
    db.delete(app)
    db.commit()
    
    return {"message": "App deleted successfully"}

