from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True, nullable=False)
    username        = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active       = Column(Boolean, default=True)
    is_admin        = Column(Boolean, default=False)
    is_publisher    = Column(Boolean, default=False)
    is_private      = Column(Boolean, default=False)
    full_name       = Column(String, nullable=True)
    bio             = Column(Text, nullable=True)
    avatar_url      = Column(String, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    
    # Settings & Persistence
    billing_address   = Column(Text, nullable=True)
    payment_method    = Column(String, nullable=True)
    biometric_enabled = Column(Boolean, default=False)
    safe_browsing     = Column(Boolean, default=True)
    auto_update       = Column(String, default="Over Wi-Fi only")
    download_pref     = Column(String, default="Ask every time")
    
    purchases       = relationship("Purchase", back_populates="user")
    notifications   = relationship("Notification", back_populates="user")

class App(Base):
    __tablename__ = "apps"
    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, index=True, nullable=False)
    description  = Column(Text)
    price        = Column(Float, default=0.0)
    category     = Column(String, index=True)
    developer    = Column(String)
    version      = Column(String, default="1.0.0")
    is_active    = Column(Boolean, default=True)
    is_approved  = Column(Boolean, default=False)
    file_path    = Column(String, nullable=True)
    icon_url     = Column(String, nullable=True)
    screenshot_urls = Column(Text, nullable=True)  # JSON-encoded list of URLs
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    purchases    = relationship("Purchase", back_populates="app")
    reviews      = relationship("Review", back_populates="app")

class Purchase(Base):
    __tablename__ = "purchases"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"))
    app_id       = Column(Integer, ForeignKey("apps.id"))
    purchased_at = Column(DateTime(timezone=True), server_default=func.now())
    user         = relationship("User", back_populates="purchases")
    app          = relationship("App",  back_populates="purchases")

class Review(Base):
    __tablename__ = "reviews"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    app_id     = Column(Integer, ForeignKey("apps.id"))
    rating     = Column(Integer, nullable=False)  # 1-5
    comment    = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user       = relationship("User")
    app        = relationship("App", back_populates="reviews")

class Notification(Base):
    __tablename__ = "notifications"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    title      = Column(String, nullable=False)
    message    = Column(Text, nullable=False)
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user       = relationship("User", back_populates="notifications")

class Post(Base):
    __tablename__ = "posts"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user       = relationship("User")
    likes      = relationship("PostLike", back_populates="post", cascade="all, delete")
    replies    = relationship("PostReply", back_populates="post", cascade="all, delete")

class PostLike(Base):
    __tablename__ = "post_likes"
    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    post    = relationship("Post", back_populates="likes")

class PostReply(Base):
    __tablename__ = "post_replies"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id    = Column(Integer, ForeignKey("posts.id"), nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user       = relationship("User")
    post       = relationship("Post", back_populates="replies")
class Follow(Base):
    __tablename__ = "follows"
    id          = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    following_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

class Message(Base):
    __tablename__ = "messages"
    id           = Column(Integer, primary_key=True, index=True)
    sender_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    content      = Column(Text, nullable=False)
    is_read      = Column(Boolean, default=False)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    sender       = relationship("User", foreign_keys=[sender_id])
    receiver     = relationship("User", foreign_keys=[receiver_id])