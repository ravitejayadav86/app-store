from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy import text
from database import engine, Base
from routes import auth, apps, users, admin, reviews, notifications, community, social
from security import limiter, add_security_headers
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import os

# Auto-migrate new columns
try:
    with engine.connect() as conn:
        print("Running migrations...")
        # Columns to add to users table
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
            try:
                # PostgreSQL specific check for column existence
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                conn.commit()
                print(f"Added column {col}")
            except Exception as e:
                # Column likely exists
                pass

        # Table creations (handled by create_all normally, but let's be explicit for social features)
        for stmt in [
            "CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, user_id INTEGER, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())",
            "CREATE TABLE IF NOT EXISTS post_likes (id SERIAL PRIMARY KEY, user_id INTEGER, post_id INTEGER)",
            "CREATE TABLE IF NOT EXISTS post_replies (id SERIAL PRIMARY KEY, user_id INTEGER, post_id INTEGER, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())",
            "CREATE TABLE IF NOT EXISTS follows (id SERIAL PRIMARY KEY, follower_id INTEGER, following_id INTEGER, created_at TIMESTAMPTZ DEFAULT NOW())",
            "CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, sender_id INTEGER, receiver_id INTEGER, content TEXT, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW())",
        ]:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass
        print("Migrations complete.")
except Exception as e:
    print(f"Migration error: {e}")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PandaStore API", version="2.0.0")

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

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}