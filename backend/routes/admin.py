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

    db.add(db_app); db.commit(); db.refresh(db_app)
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
    return db.query(models.App).filter(
        models.App.is_approved == False,
        models.App.is_active == False
    ).all()

@router.post("/approve/{app_id}", response_model=schemas.AppOut)
def approve_app(
    app_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    if not (db.query(models.App).filter(models.App.id == app_id).first()):
        raise HTTPException(404, "App not found")
    (db.query(models.App).filter(models.App.id == app_id).first()).is_approved = True
    (db.query(models.App).filter(models.App.id == app_id).first()).is_active   = True
    db.commit()
    db.refresh(db.query(models.App).filter(models.App.id == app_id).first())
    return db.query(models.App).filter(models.App.id == app_id).first()

@router.get("/pending", response_model=List[schemas.AppOut])
def pending_apps(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin)
):
    return db.query(models.App).filter(
        models.App.is_approved == False,
        models.App.is_active == False
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
    app.is_active   = True
    db.commit()
    db.refresh(app)
    return app
