from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
import os
import shutil
import uuid

router = APIRouter(prefix="/apps", tags=["apps"])

@router.get("/", response_model=List[schemas.AppOut])
def list_apps(
    category: Optional[str] = Query(None),
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db)
):
    q = db.query(models.App).filter(models.App.is_active == True, models.App.is_approved == True)
    if category:
        q = q.filter(models.App.category == category)
    return q.offset(skip).limit(limit).all()

@router.get("/{app_id}", response_model=schemas.AppOut)
def get_app(app_id: int, db: Session = Depends(get_db)):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app:
        raise HTTPException(404, "App not found")
    return app
@router.post("/{app_id}/purchase", response_model=schemas.PurchaseOut, status_code=201)
def purchase_app(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    app = db.query(models.App).filter(models.App.id == app_id, models.App.is_active == True).first()
    if not app:
        raise HTTPException(404, "App not found")
    existing = db.query(models.Purchase).filter_by(user_id=current_user.id, app_id=app_id).first()
    if existing:
        raise HTTPException(400, "Already purchased")
    purchase = models.Purchase(user_id=current_user.id, app_id=app_id)
    db.add(purchase); db.commit(); db.refresh(purchase)
    return purchase

@router.post("/{app_id}/upload", status_code=200)
def upload_file(
    app_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app:
        raise HTTPException(404, "App not found")
    os.makedirs("uploads", exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = f"uploads/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    app.file_path = file_path
    db.commit()
    return {"file_path": file_path}

@router.get("/{app_id}/download")
def download_file(
    app_id: int,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(auth.oauth2_scheme_optional)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app or not app.file_path:
        raise HTTPException(404, "File not found")

    # If it's free, everyone can download
    if app.price == 0:
        from fastapi.responses import FileResponse
        return FileResponse(app.file_path, filename=os.path.basename(app.file_path))

    # For paid apps, authentication is required
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required for paid content")
    
    # Resolve user
    current_user = auth.get_user_from_token(token, db)
    if not current_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    purchase = db.query(models.Purchase).filter_by(
        user_id=current_user.id, app_id=app_id
    ).first()
    
    if not purchase and not current_user.is_admin:
        raise HTTPException(403, "Please purchase this app first")
    
    from fastapi.responses import FileResponse
    return FileResponse(app.file_path, filename=os.path.basename(app.file_path))
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
        developer=current_user.username,
        version=app.version,
        is_active=True
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app