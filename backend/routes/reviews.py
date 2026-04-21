from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db


@router.get("/me", response_model=List[schemas.ReviewOut])
def get_my_reviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Review).filter(models.Review.user_id == current_user.id).all()

@router.get("/{app_id}", response_model=List[schemas.ReviewOut])
def get_reviews(app_id: int, db: Session = Depends(get_db)):
    return db.query(models.Review).filter(models.Review.app_id == app_id).all()


@router.post("/{app_id}", response_model=schemas.ReviewOut, status_code=201)
def submit_review(
    app_id: int,
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(400, "Rating must be between 1 and 5")

    app = db.query(models.App).filter(models.App.id == app_id, models.App.is_approved == True).first()
    if not app:
        raise HTTPException(404, "App not found")

    # One review per user per app
    existing = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.app_id == app_id
    ).first()
    if existing:
        existing.rating = review.rating
        existing.comment = review.comment
        db.commit()
        db.refresh(existing)
        return existing

    db_review = models.Review(
        user_id=current_user.id,
        app_id=app_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review
