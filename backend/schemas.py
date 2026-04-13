from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ── Auth ──────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# ── Apps ──────────────────────────────────────
class AppCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = 0.0
    category: str
    developer: str
    version: str = "1.0.0"

class AppOut(AppCreate):
    id: int
    is_active: bool
    is_approved: bool
    file_path: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True
# ── Purchases ─────────────────────────────────
class PurchaseOut(BaseModel):
    id: int
    user_id: int
    app_id: int
    purchased_at: datetime
    app: Optional[AppOut] = None
    class Config:
        from_attributes = True
