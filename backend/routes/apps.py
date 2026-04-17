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
    return db.query(models.App).filter(models.App.is_approved == True).all()

@router.get("/me", response_model=List[schemas.AppOut])
def get_my_apps(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.App).filter(models.App.developer == current_user.username).all()

@router.post("/submit", response_model=schemas.AppOut, status_code=201)
def submit_app(
    app: schemas.AppCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_app = models.App(**app.dict(), developer=current_user.username)
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
        raise HTTPException(404, "File not found")
    return FileResponse(
        app.file_path,
        filename=os.path.basename(app.file_path),
        media_type="application/octet-stream"
    )

@router.get("/{app_id}", response_model=schemas.AppOut)
def get_app(app_id: int, db: Session = Depends(get_db)):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app:
        raise HTTPException(404, "App not found")
    return app
