import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
import models

db = SessionLocal()
try:
    print("Listing all apps in database...")
    apps = db.query(models.App).all()
    for app in apps:
        print(f"ID: {app.id}, Name: {app.name}, File: {app.file_path}, Icon: {app.icon_url}, Developer: {app.developer}")
finally:
    db.close()
