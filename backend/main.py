from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from database import engine, Base
from routes import auth, apps, users, admin, reviews, notifications, community, social, telemetry
import os

# Pre-deployment schema update to ensure new columns exist in production (Postgres)
try:
    with engine.connect() as conn:
        for col, col_type in [("is_private", "BOOLEAN DEFAULT FALSE"), ("bio", "TEXT"), ("public_key", "TEXT")]:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                conn.commit()
            except Exception:
                pass # Column likely already exists
except Exception as e:
    print(f"Database connection or migration warning: {e}")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="App Store API", version="1.0.0")

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
app.include_router(telemetry.router)

@app.get("/health")
def health():
    return {"status": "ok"}