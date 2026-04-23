from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
from routes import telemetry
import os, cloudinary, cloudinary.uploader, json, re

def sanitize_id(filename: str) -> str:
    return re.sub(r'[^a-zA-Z0-9.\-_]', '_', filename)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter(prefix="/apps", tags=["apps"])

from fastapi_cache.decorator import cache

def attach_stats(app: models.App, db: Session):
    reviews = db.query(models.Review).filter(models.Review.app_id == app.id).all()
    downloads = db.query(models.Purchase).filter(models.Purchase.app_id == app.id).count()
    
    avg_rating = 0.0
    if reviews:
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
    
    # Infer maturity from category or name
    maturity = "3+"
    if app.category.lower() in ["games", "social"]:
        maturity = "12+" if any(x in app.name.lower() or x in (app.description or "").lower() for x in ["battle", "fight", "war"]) else "7+"
    
    # Simple size mapping
    file_size = "Small" if app.category.lower() in ["productivity", "utilities"] else "Standard"
    if app.category.lower() == "games": file_size = "Large"

    return {
        "id": app.id,
        "name": app.name,
        "description": app.description,
        "price": app.price,
        "category": app.category,
        "version": app.version,
        "developer": app.developer,
        "is_active": app.is_active,
        "is_approved": app.is_approved,
        "file_path": app.file_path,
        "icon_url": app.icon_url,
        "screenshot_urls": app.screenshot_urls,
        "created_at": app.created_at,
        "rating": round(avg_rating, 1),
        "reviews_count": len(reviews),
        "downloads_count": downloads,
        "maturity_rating": maturity,
        "file_size": file_size
    }

@router.get("/", response_model=List[schemas.AppOut])
def get_apps(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.App).filter(
        models.App.is_approved == True,
        models.App.is_active == True
    )
    
    if category and category.lower() != "all":
        query = query.filter(models.App.category.ilike(category))
        
    if q:
        search = f"%{q}%"
        query = query.filter(
            (models.App.name.ilike(search)) |
            (models.App.description.ilike(search)) |
            (models.App.developer.ilike(search))
        )
        
    apps = query.all()
    return [attach_stats(app, db) for app in apps]

@router.get("/me", response_model=List[schemas.AppOut])
def get_my_apps(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    apps = db.query(models.App).filter(models.App.developer == current_user.username).all()
    return [attach_stats(app, db) for app in apps]

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
        is_approved=True if app.external_url else False,
        file_path=app.external_url
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

@router.post("/{app_id}/upload")
def upload_file(
    app_id: int,
    file: UploadFile = File(None),
    icon: Optional[UploadFile] = File(None),
    screenshots: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    app = db.query(models.App).filter(
        models.App.id == app_id,
        models.App.developer == current_user.username
    ).first()
    if not app:
        raise HTTPException(404, "App not found")

    # 1. Upload App File (if provided)
    if file:
        safe_name = sanitize_id(file.filename)
        try:
            result = cloudinary.uploader.upload(
                file.file,
                resource_type="auto",
                folder="pandastore",
                public_id=f"app_{app_id}_{safe_name}"
            )
            app.file_path = result["secure_url"]
        except Exception as e:
            # Fallback to local storage if Cloudinary fails (e.g. large APKs > 10MB)
            import shutil
            import os
            os.makedirs("uploads", exist_ok=True)
            local_path = f"uploads/app_{app_id}_{safe_name}"
            file.file.seek(0)
            with open(local_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            app.file_path = f"/{local_path}"

    # 2. Upload Icon (if provided)
    if icon:
        icon_result = cloudinary.uploader.upload(
            icon.file,
            resource_type="image",
            folder="pandastore/icons",
            public_id=f"icon_{app_id}"
        )
        app.icon_url = icon_result["secure_url"]

    # 3. Upload Screenshots (if provided)
    if screenshots:
        shot_urls = []
        for i, shot in enumerate(screenshots):
            shot_result = cloudinary.uploader.upload(
                shot.file,
                resource_type="image",
                folder=f"pandastore/screenshots/{app_id}",
                public_id=f"shot_{i}_{sanitize_id(shot.filename)}"
            )
            shot_urls.append(shot_result["secure_url"])
        app.screenshot_urls = json.dumps(shot_urls)
    
    if not app.file_path and not app.external_url and not file and not icon and not screenshots:
        raise HTTPException(400, "No files or valid links provided for this app.")
        
    # Mark as approved once files are uploaded
    if app.file_path or app.external_url:
        app.is_approved = True

    db.commit()
    db.refresh(app)
    return {
        "message": "Files uploaded successfully",
        "file_path": app.file_path,
        "icon_url": app.icon_url,
        "screenshot_urls": app.screenshot_urls
    }

@router.get("/{app_id}/download")
def download_file(
    app_id: int,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_optional_user)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app or not app.file_path:
        raise HTTPException(404, "No file uploaded for this app.")
    
    # If free app and logged in, record a "purchase" to track downloads
    if current_user and app.price == 0:
        existing = db.query(models.Purchase).filter(
            models.Purchase.user_id == current_user.id,
            models.Purchase.app_id == app.id
        ).first()
        if not existing:
            purchase = models.Purchase(user_id=current_user.id, app_id=app.id)
            db.add(purchase)
            db.commit()

    # Broadcast to telemetry in background
    username = current_user.username if current_user else "Someone"
    background_tasks.add_task(telemetry.notify_download, app.name, username)

    # Redirect to file URL
    url = app.file_path
    
    # If it's a local path, ensure it's absolute for the redirect
    if url.startswith("/uploads/"):
        local_path = url.lstrip("/")
        if not os.path.exists(local_path):
            raise HTTPException(404, f"The file for '{app.name}' is missing on the server. Please contact the developer to re-upload.")
        
        # Use the request's base URL to build an absolute redirect
        base_url = str(request.base_url).rstrip("/")
        url = f"{base_url}{url}"
            
    return RedirectResponse(url=url)

@router.post("/{app_id}/nudge")
async def nudge_publisher(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app:
        raise HTTPException(404, "App not found")
    
    # Find the developer
    developer = db.query(models.User).filter(models.User.username == app.developer).first()
    if not developer:
        raise HTTPException(404, "Developer not found")

    # Check if a nudge was already sent recently (optional, skipping for simplicity)
    
    # Create notification for developer
    notif = models.Notification(
        user_id=developer.id,
        title="App Nudge!",
        message=f"Users are interested in '{app.name}'! Please upload the app files to make it available for download."
    )
    db.add(notif)
    db.commit()
    
    # Real-time notification if developer is online
    from realtime import manager
    import asyncio
    asyncio.create_task(manager.send_to_user(developer.id, {
        "type": "NOTIFICATION",
        "title": notif.title,
        "message": notif.message
    }))

    return {"message": "Nudge sent to publisher!"}

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
    return attach_stats(app, db)

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