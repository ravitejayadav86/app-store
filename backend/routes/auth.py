from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(400, "Email already registered")
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(400, "Username taken")
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=auth.hash_password(user.password)
    )
    db.add(db_user); db.commit(); db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form.username).first()
    if not user or not auth.verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = auth.create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/oauth-login", response_model=schemas.Token)
def oauth_login(payload: schemas.OAuthLoginInput, db: Session = Depends(get_db)):
    email = payload.email
    if not email:
        raise HTTPException(400, "Email required")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        username = email.split("@")[0] + str(uuid.uuid4())[:4]
        user = models.User(
            email=email,
            username=username,
            hashed_password=auth.hash_password(str(uuid.uuid4())),
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = auth.create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}