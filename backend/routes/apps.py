from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, auth
from database import get_db
from realtime import manager
import asyncio
from routes import telemetry
import os, cloudinary, cloudinary.uploader, json, re, logging, zipfile, tempfile, shutil, math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def sanitize_id(filename: str) -> str:
    return re.sub(r'[^a-zA-Z0-9.\-_]', '_', filename)

def format_size(size_bytes):
    if size_bytes <= 0: return "Varies"
    size_name = ("B", "KB", "MB", "GB", "TB")
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 1)
    return f"{s} {size_name[i]}"

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter(prefix="/apps", tags=["apps"])


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
    
    # Better fallback for file_size if not set
    file_size = app.file_size
    if not file_size:
        if app.category and app.category.lower() == "games": file_size = "256 MB"
        elif app.category and app.category.lower() in ["productivity", "utilities"]: file_size = "12 MB"
        else: file_size = "45 MB"

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

from sqlalchemy import func

@router.get("/", response_model=List[schemas.AppOut])
def get_apps(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Optimized query to fetch counts in one go
    review_counts = db.query(
        models.Review.app_id, 
        func.count(models.Review.id).label('reviews_count'),
        func.avg(models.Review.rating).label('avg_rating')
    ).group_by(models.Review.app_id).subquery()

    purchase_counts = db.query(
        models.Purchase.app_id,
        func.count(models.Purchase.id).label('downloads_count')
    ).group_by(models.Purchase.app_id).subquery()

    query = db.query(
        models.App,
        func.coalesce(review_counts.c.reviews_count, 0),
        func.coalesce(review_counts.c.avg_rating, 0.0),
        func.coalesce(purchase_counts.c.downloads_count, 0)
    ).outerjoin(review_counts, models.App.id == review_counts.c.app_id)\
     .outerjoin(purchase_counts, models.App.id == purchase_counts.c.app_id)\
     .filter(
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
        
    results = query.all()
    
    # Process results into AppOut schema
    out = []
    for app, reviews_count, avg_rating, downloads_count in results:
        # Re-use attach_stats logic but with pre-fetched data
        maturity = "3+"
        if app.category.lower() in ["games", "social"]:
            maturity = "12+" if any(x in app.name.lower() or x in (app.description or "").lower() for x in ["battle", "fight", "war"]) else "7+"
        
        app_dict = {
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
            "rating": round(float(avg_rating), 1),
            "reviews_count": int(reviews_count),
            "downloads_count": int(downloads_count),
            "maturity_rating": maturity,
            "file_size": app.file_size or "Varies"
        }
        out.append(app_dict)
    
    return out

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
async def upload_file(
    app_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    app = db.query(models.App).filter(
        models.App.id == app_id,
        models.App.developer == current_user.username
    ).first()
    if not app:
        raise HTTPException(404, "App not found")

    content_type = request.headers.get("content-type", "")

    # Support for Direct Upload Finalization (JSON)
    if "application/json" in content_type:
        data = await request.json()
        if "file_path" in data: app.file_path = data["file_path"]
        if "icon_url" in data: app.icon_url = data["icon_url"]
        if "screenshot_urls" in data: 
            urls = data["screenshot_urls"]
            app.screenshot_urls = urls if isinstance(urls, str) else json.dumps(urls)
        
        app.is_approved = True
        app.is_active = True
        db.commit()
        db.refresh(app)
        return {"message": "Direct upload finalized", "app": app}

    # Fallback to Multipart/Form-Data (Legacy or small files)
    form = await request.form()
    file = form.get("file")
    icon = form.get("icon")
    screenshots = form.getlist("screenshots")
    # 1. Upload App File (FormData Fallback)
    if file and file.filename:
        safe_name = sanitize_id(file.filename)
        is_apk = safe_name.lower().endswith('.apk')
        logger.info(f"Uploading app file: {safe_name} (is_apk: {is_apk})")
        
        try:
            # Stream file to disk to avoid memory issues
            with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{safe_name}") as tmp:
                while True:
                    chunk = await file.read(1024 * 1024) # 1MB chunks
                    if not chunk:
                        break
                    tmp.write(chunk)
                tmp_path = tmp.name
                file_size_bytes = os.path.getsize(tmp_path)
                app.file_size = format_size(file_size_bytes)
            
            upload_path = tmp_path
            final_filename = safe_name
            
            # Cloudinary often blocks .apk files in raw mode, so we zip them
            if is_apk:
                from fastapi.concurrency import run_in_threadpool
                zip_path = tmp_path + ".zip"
                
                def create_zip(src, dst, arcname):
                    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as zipf:
                        zipf.write(src, arcname)
                
                await run_in_threadpool(create_zip, tmp_path, zip_path, safe_name)
                
                upload_path = zip_path
                final_filename = safe_name + ".zip"
                logger.info(f"Zipped APK for Cloudinary: {final_filename}")

            try:
                # Skip Cloudinary for files > 100MB to avoid timeout
                if os.path.getsize(upload_path) > 100 * 1024 * 1024:
                    raise Exception("File too large for Cloudinary, saving locally directly.")
                    
                # Try Cloudinary upload - using run_in_threadpool because upload_large is blocking
                from fastapi.concurrency import run_in_threadpool
                logger.info(f"Attempting Cloudinary upload for {final_filename}")
                
                result = await run_in_threadpool(
                    cloudinary.uploader.upload_large,
                    upload_path,
                    resource_type="raw",
                    folder="pandastore/apps",
                    public_id=f"app_{app_id}_{final_filename}",
                    overwrite=True
                )
                app.file_path = result["secure_url"]
                logger.info(f"Cloudinary upload successful: {app.file_path}")
            except Exception as e:
                logger.error(f"Cloudinary upload failed: {str(e)}. Falling back to local storage.")
                # Fallback to local storage
                os.makedirs("uploads", exist_ok=True)
                dest_path = f"uploads/app_{app_id}_{safe_name}"
                shutil.copy2(tmp_path, dest_path)
                app.file_path = f"/{dest_path}"
                logger.info(f"Local fallback successful: {app.file_path}")
            finally:
                # Cleanup temporary files
                if os.path.exists(tmp_path): 
                    try: os.remove(tmp_path)
                    except: pass
                if is_apk and os.path.exists(upload_path): 
                    try: os.remove(upload_path)
                    except: pass
                
        except Exception as e:
            logger.error(f"File processing error: {str(e)}")
            # Even if processing fails, don't crash everything if we have other files

    # 2. Upload Icon
    if icon and icon.filename:
        logger.info(f"Uploading icon for app_{app_id}")
        try:
            from fastapi.concurrency import run_in_threadpool
            icon_content = await icon.read()
            icon_result = await run_in_threadpool(
                cloudinary.uploader.upload,
                icon_content,
                resource_type="image",
                folder="pandastore/icons",
                public_id=f"icon_{app_id}",
                overwrite=True
            )
            app.icon_url = icon_result["secure_url"]
            logger.info(f"Icon upload successful: {app.icon_url}")
        except Exception as e:
            logger.error(f"Icon upload failed: {str(e)}")

    # 3. Upload Screenshots
    if screenshots:
        logger.info(f"Uploading {len(screenshots)} screenshots for app_{app_id}")
        shot_urls = []
        from fastapi.concurrency import run_in_threadpool
        # Support both single and multiple screenshots if sent via same field name
        for i, shot in enumerate(screenshots):
            if not shot or not shot.filename:
                continue
            try:
                shot_content = await shot.read()
                shot_result = await run_in_threadpool(
                    cloudinary.uploader.upload,
                    shot_content,
                    resource_type="image",
                    folder=f"pandastore/screenshots/{app_id}",
                    public_id=f"shot_{i}_{sanitize_id(shot.filename)}",
                    overwrite=True
                )
                shot_urls.append(shot_result["secure_url"])
            except Exception as se:
                logger.error(f"Screenshot {i} failed: {str(se)}")
        
        if shot_urls:
            # Append to existing screenshots if any
            existing_shots = json.loads(app.screenshot_urls) if app.screenshot_urls else []
            existing_shots.extend(shot_urls)
            app.screenshot_urls = json.dumps(existing_shots)
            logger.info(f"Screenshots updated: {len(shot_urls)} new files added")

    # Finalize
    if app.file_path or app.external_url:
        app.is_approved = True
        app.is_active = True
        logger.info(f"App {app_id} marked as approved and active.")

    try:
        db.commit()
        db.refresh(app)
        return {
            "message": "Upload process completed",
            "file_path": app.file_path,
            "icon_url": app.icon_url,
            "screenshots": json.loads(app.screenshot_urls) if app.screenshot_urls else []
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Database update failed: {str(e)}")
        raise HTTPException(500, f"Database update failed: {str(e)}")

@router.get("/{app_id}/download")
async def download_file(
    app_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app or not app.file_path:
        raise HTTPException(404, "No file uploaded for this app yet.")
    
    # Broadcast to telemetry in background
    username = current_user.username if current_user else "Someone"
    background_tasks.add_task(telemetry.notify_download, app.name, username)

    # If it's a Cloudinary URL or external URL, redirect directly
    if app.file_path.startswith("http"):
        return RedirectResponse(url=app.file_path)
    
    # If it's a local path
    url = app.file_path
    if url.startswith("/uploads/"):
        local_path = url.lstrip("/")
        if not os.path.exists(local_path):
            raise HTTPException(404, f"The file for '{app.name}' is missing on the server. Please contact the developer to re-upload.")
        
        # Use the request's base URL to build an absolute redirect
        base_url = str(request.base_url).rstrip("/")
        url = f"{base_url}{url}"
        return RedirectResponse(url=url)
            
    raise HTTPException(404, "File not found or invalid path.")

@router.post("/{app_id}/nudge")
async def nudge_publisher(
    app_id: int,
    background_tasks: BackgroundTasks,
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
    background_tasks.add_task(manager.send_to_user, developer.id, {
        "type": "NOTIFICATION",
        "title": notif.title,
        "message": notif.message
    })

    return {"message": "Nudge sent to publisher!"}

@router.post("/{app_id}/grant")
def grant_access(
    app_id: int,
    payload: dict,
    background_tasks: BackgroundTasks,
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
        
        # Broadcast download event for realtime UI
        from realtime import manager
        background_tasks.add_task(manager.broadcast, {
            "type": "APP_DOWNLOADED",
            "app_id": app_id
        })
        
    return {"message": f"Access granted to {username}"}

@router.post("/generate-signature")
def generate_signature(
    params: dict,
    current_user: models.User = Depends(auth.get_current_user)
):
    """Generate a Cloudinary signature for direct-to-cloud uploads."""
    timestamp = params.get("timestamp")
    folder = params.get("folder", "pandastore/apps")
    
    # Sign the request params
    to_sign = {
        "timestamp": timestamp,
        "folder": folder
    }
    
    signature = cloudinary.utils.api_sign_request(
        to_sign,
        os.getenv("CLOUDINARY_API_SECRET")
    )
    
    return {
        "signature": signature,
        "api_key": os.getenv("CLOUDINARY_API_KEY"),
        "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME")
    }

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