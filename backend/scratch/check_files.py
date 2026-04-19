import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
import models

def check_apps():
    db = SessionLocal()
    try:
        apps = db.query(models.App).all()
        print(f"Found {len(apps)} total apps in local database.")
        for app in apps:
            print(f"App ID: {app.id}, Name: {app.name}")
            print(f"  File Path: {app.file_path}")
            if app.file_path:
                exists = os.path.exists(app.file_path)
                print(f"  File Exists on local disk: {exists}")
            else:
                print(f"  No file path set.")
            print("-" * 20)
    finally:
        db.close()

if __name__ == "__main__":
    check_apps()
