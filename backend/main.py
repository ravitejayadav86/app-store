import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text, inspect, create_engine
from database import engine, Base, SessionLocal
import models
from routes import auth, apps, users, admin, reviews, notifications, community, social
from security import limiter, add_security_headers
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Table creation handled at runtime if needed, wrapped in try-except to prevent startup failure
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("Tables synchronized.")
    except Exception as e:
        print(f"Table sync error: {e}")

def run_migrations():
    # Data migration for real file_size
    import requests
    import math
    
    def format_size(size_bytes):
        if size_bytes <= 0: return "Varies"
        size_name = ("B", "KB", "MB", "GB", "TB")
        i = int(math.floor(math.log(size_bytes, 1024)))
        p = math.pow(1024, i)
        s = round(size_bytes / p, 1)
        return f"{s} {size_name[i]}"

    db = SessionLocal()
    try:
        # Update apps that don't have a "real" size yet (looking for estimates or None)
        # We assume sizes like '256 MB', '12 MB', '45 MB' were estimates from previous migration
        apps_to_update = db.query(models.App).all()
        for app in apps_to_update:
            if not app.file_path:
                continue
            
            real_size = None
            # 1. Check Remote (Cloudinary)
            if app.file_path.startswith("http"):
                try:
                    # Use a short timeout to not block startup too long
                    response = requests.head(app.file_path, allow_redirects=True, timeout=2)
                    if response.status_code == 200:
                        size = response.headers.get('Content-Length')
                        if size:
                            real_size = format_size(int(size))
                except Exception:
                    pass
            # 2. Check Local
            elif os.path.exists(app.file_path.lstrip('/')):
                try:
                    size = os.path.getsize(app.file_path.lstrip('/'))
                    real_size = format_size(size)
                except Exception:
                    pass
            
            if real_size:
                app.file_size = real_size
        
        db.commit()
    except Exception as e:
        print(f"Real size migration error: {e}")
        db.rollback()
    finally:
        db.close()

    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if "users" in inspector.get_table_names():
                columns = [c["name"] for c in inspector.get_columns("users")]
                for col, col_type in [
                    ("is_private", "BOOLEAN DEFAULT FALSE"),
                    ("is_publisher", "BOOLEAN DEFAULT FALSE"),
                    ("bio", "TEXT"),
                    ("avatar_url", "TEXT"),
                    ("full_name", "TEXT"),
                    ("biometric_enabled", "BOOLEAN DEFAULT FALSE"),
                    ("safe_browsing", "BOOLEAN DEFAULT TRUE"),
                    ("auto_update", "TEXT DEFAULT 'Over Wi-Fi only'"),
                    ("download_pref", "TEXT DEFAULT 'Ask every time'"),
                    ("billing_address", "TEXT"),
                    ("payment_method", "TEXT"),
                ]:
                    if col not in columns:
                        try:
                            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                            conn.commit()
                        except Exception:
                            pass
            if "apps" in inspector.get_table_names():
                columns = [c["name"] for c in inspector.get_columns("apps")]
                for col, col_type in [("icon_url", "TEXT"), ("screenshot_urls", "TEXT"), ("file_size", "TEXT")]:
                    if col not in columns:
                        try:
                            conn.execute(text(f"ALTER TABLE apps ADD COLUMN {col} {col_type}"))
                            conn.commit()
                        except Exception:
                            pass
            if "messages" in inspector.get_table_names():
                columns = [c["name"] for c in inspector.get_columns("messages")]
                for col, col_type in [("media_url", "TEXT"), ("media_type", "TEXT")]:
                    if col not in columns:
                        try:
                            conn.execute(text(f"ALTER TABLE messages ADD COLUMN {col} {col_type}"))
                            conn.commit()
                        except Exception:
                            pass
    except Exception as e:
        print(f"Migration error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    run_migrations()
    
    # Simple cleanup task for temporary or old chat files
    try:
        import time
        chat_dir = "uploads/chat"
        if os.path.exists(chat_dir):
            now = time.time()
            # Clean files older than 30 days
            limit = 30 * 24 * 60 * 60 
            for f in os.listdir(chat_dir):
                fpath = os.path.join(chat_dir, f)
                if os.stat(fpath).st_mtime < now - limit:
                    os.remove(fpath)
                    print(f"Cleaned up old chat file: {f}")
    except Exception as e:
        print(f"Cleanup error: {e}")
        
    yield

app = FastAPI(title="PandaStore API", version="2.0.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.middleware("http")(add_security_headers)

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