import asyncio
import os
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy import text, inspect
from database import engine, Base
from routes import auth, apps, users, admin, reviews, notifications, community, social, copilot
from security import limiter, add_security_headers
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Create tables first (only creates missing tables)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables synchronized.")
except Exception as e:
    print(f"Table synchronization error: {e}")

# Auto-migrate new columns for existing tables
try:
    with engine.connect() as conn:
        inspector = inspect(engine)
        print("Running manual migrations...")
        
        # Check users table
        if "users" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("users")]
            user_cols = [
                ("is_private", "BOOLEAN DEFAULT FALSE"),
                ("is_publisher", "BOOLEAN DEFAULT FALSE"),
                ("bio", "TEXT"),
                ("public_key", "TEXT"),
                ("avatar_url", "TEXT"),
                ("full_name", "TEXT"),
                ("billing_address", "TEXT"),
                ("payment_method", "TEXT"),
                ("biometric_enabled", "BOOLEAN DEFAULT FALSE"),
                ("safe_browsing", "BOOLEAN DEFAULT TRUE"),
                ("auto_update", "TEXT DEFAULT 'Over Wi-Fi only'"),
                ("download_pref", "TEXT DEFAULT 'Ask every time'"),
            ]
            for col, col_type in user_cols:
                if col not in columns:
                    try:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                        conn.commit()
                        print(f"Added column {col} to users")
                    except Exception as e:
                        print(f"Error adding {col} to users: {e}")

        # Check apps table
        if "apps" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("apps")]
            app_cols = [
                ("icon_url", "TEXT"),
                ("screenshot_urls", "TEXT"),
            ]
            for col, col_type in app_cols:
                if col not in columns:
                    try:
                        conn.execute(text(f"ALTER TABLE apps ADD COLUMN {col} {col_type}"))
                        conn.commit()
                        print(f"Added column {col} to apps")
                    except Exception as e:
                        print(f"Error adding {col} to apps: {e}")
                        
        if "messages" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("messages")]
            msg_cols = [
                ("media_url", "TEXT"),
                ("media_type", "TEXT"),
            ]
            for col, col_type in msg_cols:
                if col not in columns:
                    try:
                        conn.execute(text(f"ALTER TABLE messages ADD COLUMN {col} {col_type}"))
                        conn.commit()
                        print(f"Added column {col} to messages")
                    except Exception as e:
                        print(f"Error adding {col} to messages: {e}")

        print("Migrations complete.")
except Exception as e:
    print(f"Migration error: {e}")

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

app = FastAPI(title="PandaStore API", version="2.0.0")

@app.on_event("startup")
async def startup():
    # Cache init
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        redis = aioredis.from_url(
            redis_url, 
            encoding="utf8", 
            decode_responses=True,
            socket_connect_timeout=5.0
        )
        await asyncio.wait_for(redis.ping(), timeout=5.0)
        FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
        print("Redis cache initialized")
    except Exception as e:
        print(f"Could not initialize Redis cache: {e}")

@app.on_event("shutdown")
async def shutdown():
    pass

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers
app.middleware("http")(add_security_headers)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(apps.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(reviews.router)
app.include_router(notifications.router)
app.include_router(community.router)
app.include_router(social.router)
app.include_router(copilot.router)

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}