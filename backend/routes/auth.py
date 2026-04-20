from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db
from security import (
    check_login_attempts, record_failed_attempt,
    clear_attempts, sanitize_input, validate_username,
    validate_password_strength, limiter
)
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserOut, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Validate username
    if not validate_username(user.username):
        raise HTTPException(400, "Username must be 3-30 characters, letters/numbers/underscore only")
    
    # Validate password strength
    valid, msg = validate_password_strength(user.password)
    if not valid:
        raise HTTPException(400, msg)
    
    # Sanitize inputs
    user.username = sanitize_input(user.username)
    
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(400, "Email already registered")
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(400, "Username taken")
    
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=auth.hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
@limiter.limit("10/minute")
def login(request: Request, form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    identifier = form.username.lower()
    
    # Check lockout
    check_login_attempts(identifier)
    
    user = db.query(models.User).filter(models.User.username == form.username).first()
    
    if not user or not auth.verify_password(form.password, user.hashed_password):
        record_failed_attempt(identifier)
        attempts_left = 5 - len([a for a in (login_attempts if hasattr(login_attempts, '__getitem__') else {}).get(identifier, []) if True])
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )
    
    # Clear attempts on success
    clear_attempts(identifier)
    
    token = auth.create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/oauth-login", response_model=schemas.Token)
@limiter.limit("20/minute")
def oauth_login(request: Request, payload: schemas.OAuthLoginInput, db: Session = Depends(get_db)):
    email = payload.email
    if not email:
        raise HTTPException(400, "Email required")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        username = sanitize_input(email.split("@")[0]) + str(uuid.uuid4())[:4]
        if not validate_username(username):
            username = "user" + str(uuid.uuid4())[:8]
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

@router.post("/logout")
def logout():
    # Client should delete the token
    return {"message": "Logged out successfully"}

@router.get("/verify")
def verify_token(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "valid": True,
        "username": current_user.username,
        "is_admin": current_user.is_admin
    }