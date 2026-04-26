import os
import requests
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import math

# Add parent dir to path to import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import models

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pandastore.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def format_size(size_bytes):
    if size_bytes <= 0: return "Varies"
    size_name = ("B", "KB", "MB", "GB", "TB")
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 1)
    return f"{s} {size_name[i]}"

def fix_sizes():
    db = SessionLocal()
    try:
        apps = db.query(models.App).all()
        print(f"Scanning {len(apps)} apps for real sizes...")
        
        for app in apps:
            if not app.file_path:
                continue
                
            real_size = None
            
            # 1. If it's a Cloudinary/Remote URL
            if app.file_path.startswith("http"):
                try:
                    response = requests.head(app.file_path, allow_redirects=True, timeout=5)
                    size = response.headers.get('Content-Length')
                    if size:
                        real_size = format_size(int(size))
                        print(f"Found remote size for {app.name}: {real_size}")
                except Exception as e:
                    print(f"Failed to HEAD {app.name}: {e}")
            
            # 2. If it's a local path
            else:
                local_path = app.file_path.lstrip('/')
                if os.path.exists(local_path):
                    try:
                        size = os.path.getsize(local_path)
                        real_size = format_size(size)
                        print(f"Found local size for {app.name}: {real_size}")
                    except Exception as e:
                        print(f"Failed to stat {app.name}: {e}")
            
            if real_size:
                app.file_size = real_size
        
        db.commit()
        print("Successfully updated all app sizes with real server data.")
    finally:
        db.close()

if __name__ == "__main__":
    fix_sizes()
