from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routes import auth, apps, users, admin
import os
import dns.resolver

# Fix email-validator DNS resolution issues
try:
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8']
except Exception as e:
    print(f"Warning: Could not configure custom DNS resolver: {e}")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="My Custom App Store",
    description="API for managing apps, users, and reviews.",
    version="2.0.0",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(apps.router)
app.include_router(users.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "App Store API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}