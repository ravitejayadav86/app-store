from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
import storage

router = APIRouter(prefix="/apps", tags=["apps"])

@router.get("/", response_model=List[schemas.AppOut])
def get_apps(db: Session = Depends(get_db)):
    return db.query(models.App).filter(models.App.is_approved == True).all()

@router.get("/me", response_model=List[schemas.AppOut])
def get_my_apps(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.App).filter(models.App.developer == current_user.username).all()

@router.post("/submit", response_model=schemas.AppOut, status_code=201)
def submit_app(app: schemas.AppCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_app = models.App(**app.dict(), developer=current_user.username)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

@router.post("/{app_id}/upload")
async def upload_file_route(
    app_id: int,
    file: Optional[UploadFile] = File(None),
    icon: Optional[UploadFile] = File(None),
    screenshots: Optional[List[UploadFile]] = File(None),
    external_url: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    app = db.query(models.App).filter(models.App.id == app_id, models.App.developer == current_user.username).first()
    if not app:
        raise HTTPException(404, "App not found")
    if file and file.filename:
        if app.file_path and app.file_path.startswith("https://"):
            storage.delete_file(app.file_path)
            
        # 🌟 HYBRID CLOUD ROUTING LOGIC 🌟
        if app.category == "Music":
            file_url = storage.upload_music_to_gcp(file.file, file.filename, file.content_type or "audio/mpeg")
        else:
            file_url = storage.upload_file(file.file, file.filename, file.content_type or "application/octet-stream")
            
        app.file_path = file_url
    if icon and icon.filename:
        icon_url = storage.upload_file(icon.file, icon.filename, icon.content_type or "image/png")
        app.icon_url = icon_url
    if screenshots:
        import json
        screenshot_urls = []
        for s in screenshots:
            if s and s.filename:
                url = storage.upload_file(s.file, s.filename, s.content_type or "image/png")
                screenshot_urls.append(url)
        if screenshot_urls:
            app.screenshot_urls = json.dumps(screenshot_urls)
    if external_url:
        app.file_path = external_url
    db.commit()
    return {"message": "Upload successful", "file_url": app.file_path}

@router.post("/{app_id}/grant")
def grant_access(app_id: int, payload: dict, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    username = payload.get("username")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    existing = db.query(models.Purchase).filter(models.Purchase.user_id == user.id, models.Purchase.app_id == app_id).first()
    if not existing:
        purchase = models.Purchase(user_id=user.id, app_id=app_id)
        db.add(purchase)
        db.commit()
    return {"message": "Access granted to " + str(username)}

@router.get("/{app_id}/download")
def download_file(app_id: int, db: Session = Depends(get_db)):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app or not app.file_path:
        raise HTTPException(404, "File not found")
    if app.file_path.startswith("https://"):
        download_url = storage.generate_download_url(app.file_path)
        return RedirectResponse(url=download_url)
    raise HTTPException(404, "File not available")

@router.get("/{app_id}", response_model=schemas.AppOut)
def get_app(app_id: int, db: Session = Depends(get_db)):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app:
        raise HTTPException(404, "App not found")
    return app

@router.delete("/{app_id}", status_code=204)
def delete_app(app_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    app = db.query(models.App).filter(models.App.id == app_id, models.App.developer == current_user.username).first()
    if not app:
        raise HTTPException(404, "App not found")
    if app.file_path and app.file_path.startswith("https://"):
        storage.delete_file(app.file_path)
    db.query(models.Review).filter(models.Review.app_id == app_id).delete()
    db.query(models.Purchase).filter(models.Purchase.app_id == app_id).delete()
    db.delete(app)
    db.commit()
