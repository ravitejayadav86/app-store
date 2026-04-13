from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import models, schemas, auth
from database import get_db
router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.get("/me/purchases", response_model=List[schemas.PurchaseOut])
def my_purchases(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from sqlalchemy.orm import joinedload
    return db.query(models.Purchase).options(joinedload(models.Purchase.app)).filter(models.Purchase.user_id == current_user.id).all()
