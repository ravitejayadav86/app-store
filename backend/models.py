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
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    purchases       = relationship("Purchase", back_populates="user")

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
