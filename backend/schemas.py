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
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False
    is_publisher: bool = False
    is_private: bool = False
    billing_address: Optional[str] = None
    payment_method: Optional[str] = None
    biometric_enabled: bool = False
    safe_browsing: bool = True
    auto_update: str = "Over Wi-Fi only"
    download_pref: str = "Ask every time"
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class OAuthLoginInput(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class TokenData(BaseModel):
    username: Optional[str] = None

# ── Apps ──────────────────────────────────────
class AppBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = 0.0
    category: str
    version: str = "1.0.0"
    external_url: Optional[str] = None
    icon_url: Optional[str] = None
    screenshot_urls: Optional[str] = None

class AppCreate(AppBase):
    pass # No developer field here, it's inferred from Auth token

class AppOut(AppBase):
    id: int
    developer: str
    is_active: bool
    is_approved: bool
    file_path: Optional[str] = None
    icon_url: Optional[str] = None
    screenshot_urls: Optional[str] = None
    created_at: datetime
    rating: float = 0.0
    reviews_count: int = 0
    downloads_count: int = 0
    maturity_rating: str = "3+"
    file_size: str = "Varies"
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
    avatar_url: Optional[str] = None
    class Config:
        from_attributes = True

class PostOut(BaseModel):
    id: int
    user_id: int
    content: str
    created_at: datetime
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    likes_count: int = 0
    liked_by_me: bool = False
    replies: List[ReplyOut] = []
    class Config:
        from_attributes = True

# -- Social --
class UserProfile(BaseModel):
    id: int
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_private: bool
    is_admin: bool
    public_key: Optional[str] = None
    created_at: datetime
    followers_count: int = 0
    following_count: int = 0
    installs_count: int = 0
    reviews_count: int = 0
    is_following: bool = False
    apps: List[AppOut] = []
    posts: List[PostOut] = []
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None

class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    is_read: bool
    created_at: datetime
    sender_username: Optional[str] = None
    sender_avatar_url: Optional[str] = None
    class Config:
        from_attributes = True

class UpdateProfile(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    is_private: Optional[bool] = None
    public_key: Optional[str] = None
    billing_address: Optional[str] = None
    payment_method: Optional[str] = None
    biometric_enabled: Optional[bool] = None
    safe_browsing: Optional[bool] = None
    auto_update: Optional[str] = None
    download_pref: Optional[str] = None

class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None

class UserStats(BaseModel):
    installs: int
    reviews: int
    published: int
    followers: int
    following: int