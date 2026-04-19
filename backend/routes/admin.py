from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(403, "Admin access required")
    return current_user


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
    app.is_active = False
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
