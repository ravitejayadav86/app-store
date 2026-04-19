from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

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
class AppBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = 0.0
    category: str
    version: str = "1.0.0"

class AppCreate(AppBase):
    pass # No developer field here, it's inferred from Auth token

class AppOut(AppBase):
    id: int
    developer: str
    is_active: bool
    is_approved: bool
    file_path: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class GrantAccessInput(BaseModel):
    username: str

# ── Purchases ─────────────────────────────────
class PurchaseOut(BaseModel):
    id: int
    user_id: int
    app_id: int
    purchased_at: datetime
    app: Optional[AppOut] = None
    class Config:
        from_attributes = True

# ── Reviews ───────────────────────────────────
class ReviewCreate(BaseModel):
    rating: int  # 1-5
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    user_id: int
    app_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# ── Notifications ──────────────────────────────
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# -- Community --
class PostCreate(BaseModel):
    content: str

class ReplyCreate(BaseModel):
    content: str

class ReplyOut(BaseModel):
    id: int
    user_id: int
    post_id: int
    content: str
    created_at: datetime
    username: Optional[str] = None
    class Config:
        from_attributes = True

class PostOut(BaseModel):
    id: int
    user_id: int
    content: str
    created_at: datetime
    username: Optional[str] = None
    likes_count: int = 0
    liked_by_me: bool = False
    replies: List[ReplyOut] = []
    class Config:
        from_attributes = True

# -- Social --
class UserProfile(BaseModel):
    id: int
    username: str
    bio: Optional[str] = None
    is_private: bool
    is_admin: bool
    public_key: Optional[str] = None
    created_at: datetime
    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False
    apps: List[AppOut] = []
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str

class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime
    sender_username: Optional[str] = None
    class Config:
        from_attributes = True

class UpdateProfile(BaseModel):
    bio: Optional[str] = None
    is_private: Optional[bool] = None
    public_key: Optional[str] = None