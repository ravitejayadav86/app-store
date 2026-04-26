from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas, auth
from database import get_db
import os

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(403, "Admin access required")
    return current_user


# ── Dashboard Stats ───────────────────────────────────────────
@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    """Aggregate stats for the admin dashboard."""
    total_users = db.query(models.User).count()
    total_apps = db.query(models.App).count()
    approved_apps = db.query(models.App).filter(models.App.is_approved == True).count()
    pending_apps = db.query(models.App).filter(models.App.is_approved == False).count()
    total_downloads = db.query(models.Purchase).count()
    total_reviews = db.query(models.Review).count()
    total_publishers = db.query(models.User).filter(models.User.is_publisher == True).count()
    total_posts = db.query(models.Post).count()

    # Revenue estimate (sum of prices for purchased apps)
    revenue_result = db.query(func.sum(models.App.price)).join(
        models.Purchase, models.Purchase.app_id == models.App.id
    ).scalar()
    total_revenue = round(float(revenue_result or 0), 2)

    # File health — count apps with missing local files
    all_apps = db.query(models.App).filter(models.App.file_path != None).all()
    missing_files = 0
    for app in all_apps:
        if app.file_path and app.file_path.startswith("/uploads/"):
            if not os.path.exists(app.file_path.lstrip("/")):
                missing_files += 1

    return {
        "total_users": total_users,
        "total_apps": total_apps,
        "approved_apps": approved_apps,
        "pending_apps": pending_apps,
        "total_downloads": total_downloads,
        "total_reviews": total_reviews,
        "total_publishers": total_publishers,
        "total_posts": total_posts,
        "total_revenue": total_revenue,
        "missing_files": missing_files,
    }


# ── User Management ───────────────────────────────────────────
@router.get("/users")
def list_all_users(
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    """List all users with basic stats."""
    query = db.query(models.User)
    if q:
        search = f"%{q}%"
        query = query.filter(
            (models.User.username.ilike(search)) |
            (models.User.email.ilike(search))
        )
    users = query.order_by(models.User.created_at.desc()).all()
    result = []
    for u in users:
        apps_count = db.query(models.App).filter(models.App.developer == u.username).count()
        downloads_count = db.query(models.Purchase).filter(models.Purchase.user_id == u.id).count()
        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "avatar_url": u.avatar_url,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "is_publisher": u.is_publisher,
            "created_at": u.created_at,
            "apps_count": apps_count,
            "downloads_count": downloads_count,
        })
    return result


@router.post("/users/{user_id}/toggle-admin")
def toggle_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Promote or demote a user's admin status."""
    if current_user.id == user_id:
        raise HTTPException(400, "Cannot change your own admin status")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_admin = not user.is_admin
    db.commit()
    return {"message": f"{'Promoted' if user.is_admin else 'Demoted'} {user.username}", "is_admin": user.is_admin}


@router.post("/users/{user_id}/toggle-publisher")
def toggle_publisher(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    """Toggle publisher status for a user."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_publisher = not user.is_publisher
    db.commit()
    return {"message": f"Publisher status {'enabled' if user.is_publisher else 'disabled'} for {user.username}", "is_publisher": user.is_publisher}


@router.post("/users/{user_id}/toggle-active")
def toggle_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Ban or unban a user."""
    if current_user.id == user_id:
        raise HTTPException(400, "Cannot deactivate your own account")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {user.username} {'activated' if user.is_active else 'deactivated'}", "is_active": user.is_active}


# ── File Health Audit ─────────────────────────────────────────
@router.get("/file-health")
def check_file_health(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    """Audit all apps for missing files (ephemeral storage issues)."""
    apps = db.query(models.App).filter(models.App.file_path != None).all()
    results = []
    for app in apps:
        status = "ok"
        storage = "cloud"
        if app.file_path:
            if app.file_path.startswith("http"):
                storage = "cloud"
                status = "ok"
            elif app.file_path.startswith("/uploads/"):
                storage = "local"
                if not os.path.exists(app.file_path.lstrip("/")):
                    status = "missing"
                else:
                    status = "ok"
            else:
                storage = "unknown"
                status = "unknown"

        results.append({
            "id": app.id,
            "name": app.name,
            "developer": app.developer,
            "file_path": app.file_path,
            "storage": storage,
            "status": status,
            "is_approved": app.is_approved,
        })
    return results


# ── App CRUD ──────────────────────────────────────────────────
@router.post("/apps", response_model=schemas.AppOut, status_code=201)
def create_app(
    app: schemas.AppCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    db_app = models.App(**app.dict())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


@router.delete("/apps/{app_id}", status_code=204)
def delete_app(
    app_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app:
        raise HTTPException(404, "App not found")
    
    # Hard delete logic
    # 1. Delete associated files
    if app.file_path and app.file_path.startswith("/uploads/"):
        local = app.file_path.lstrip("/")
        if os.path.exists(local):
            try:
                os.remove(local)
            except Exception as e:
                print(f"Error deleting file: {e}")
            
    # 2. Delete associated records
    db.query(models.Review).filter(models.Review.app_id == app_id).delete()
    db.query(models.Purchase).filter(models.Purchase.app_id == app_id).delete()
    
    # 3. Delete the app record
    db.delete(app)
    db.commit()


@router.get("/pending", response_model=List[schemas.AppOut])
def pending_apps(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    # Show ANY app that hasn't been approved yet, regardless of is_active
    return db.query(models.App).filter(
        models.App.is_approved == False
    ).all()

@router.get("/published", response_model=List[schemas.AppOut])
def published_apps(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    return db.query(models.App).filter(
        models.App.is_approved == True,
        models.App.is_active == True
    ).all()


@router.post("/approve/{app_id}", response_model=schemas.AppOut)
def approve_app(
    app_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app:
        raise HTTPException(404, "App not found")
    app.is_approved = True
    app.is_active = True
    db.commit()
    db.refresh(app)
    # Notify the developer
    developer = db.query(models.User).filter(models.User.username == app.developer).first()
    if developer:
        notif = models.Notification(
            user_id=developer.id,
            title="App Approved 🎉",
            message=f"Your submission '{app.name}' has been approved and is now live on PandaStore!"
        )
        db.add(notif)
        db.commit()
    return app


@router.post("/approve-all", status_code=200)
def approve_all_pending(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    """Bulk-approve all apps that are pending review."""
    apps = db.query(models.App).filter(models.App.is_approved == False).all()
    count = 0
    for app in apps:
        app.is_approved = True
        app.is_active = True
        count += 1
    db.commit()
    return {"approved": count, "message": f"{count} apps approved and set live"}


@router.post("/reject/{app_id}", status_code=200)
def reject_app(
    app_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    app = db.query(models.App).filter(models.App.id == app_id).first()
    if not app:
        raise HTTPException(404, "App not found")
    app_name = app.name
    developer_username = app.developer
    # Notify the developer before deleting
    developer = db.query(models.User).filter(models.User.username == developer_username).first()
    if developer:
        notif = models.Notification(
            user_id=developer.id,
            title="Submission Not Approved",
            message=f"Your submission '{app_name}' was reviewed but did not meet our guidelines and was not approved at this time."
        )
        db.add(notif)
    db.delete(app)
    db.commit()
    return {"message": "App rejected and removed"}
