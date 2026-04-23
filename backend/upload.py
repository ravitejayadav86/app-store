import sys
import os
import shutil
import json
import sqlite3
import cloudinary
import cloudinary.uploader
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Add current directory to path to import models and database
sys.path.append(os.path.join(os.getcwd()))

from database import SessionLocal, engine
import models

# Load environment variables
load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_app(app_name, file_path, icon_path=None, developer="raviteja"):
    db = SessionLocal()
    try:
        # Find or create the app
        app = db.query(models.App).filter(models.App.name == app_name).first()
        if not app:
            print(f"Creating new app entry for {app_name}...")
            app = models.App(
                name=app_name,
                description=f"Premium version of {app_name}.",
                category="Games",
                developer=developer,
                is_active=True,
                is_approved=False
            )
            db.add(app)
            db.commit()
            db.refresh(app)
        
        print(f"Processing App ID: {app.id}")

        # 1. Upload App File
        if file_path and os.path.exists(file_path):
            print(f"Uploading file: {file_path}")
            import zipfile
            temp_zip = file_path + ".zip"
            is_apk = file_path.lower().endswith('.apk')
            upload_path = file_path
            
            if is_apk:
                print(f"Zipping APK for Cloudinary compatibility...")
                with zipfile.ZipFile(temp_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    zipf.write(file_path, os.path.basename(file_path))
                upload_path = temp_zip
                
            try:
                result = cloudinary.uploader.upload_large(
                    upload_path,
                    resource_type="raw",
                    folder="pandastore",
                    public_id=f"app_{app.id}_{os.path.basename(file_path)}.zip"
                )
                app.file_path = result["secure_url"]
                print(f"File uploaded to Cloudinary: {app.file_path}")
            except Exception as e:
                print(f"Cloudinary upload failed: {e}")
                os.makedirs("uploads", exist_ok=True)
                dest = f"uploads/app_{app.id}_{os.path.basename(file_path)}"
                shutil.copy2(file_path, dest)
                app.file_path = f"/{dest}"
                print(f"File stored locally: {app.file_path}")
            finally:
                if is_apk and os.path.exists(temp_zip):
                    os.remove(temp_zip)

        # 2. Upload Icon
        if icon_path and os.path.exists(icon_path):
            print(f"Uploading icon: {icon_path}")
            try:
                icon_result = cloudinary.uploader.upload(
                    icon_path,
                    resource_type="image",
                    folder="pandastore/icons",
                    public_id=f"icon_{app.id}"
                )
                app.icon_url = icon_result["secure_url"]
                print(f"Icon uploaded to Cloudinary: {app.icon_url}")
            except Exception as e:
                print(f"Icon upload failed: {e}")

        # Finalize
        if app.file_path:
            app.is_approved = True
            app.is_active = True
        
        db.commit()
        print(f"App {app_name} updated successfully in the database!")
        
    except Exception as e:
        print(f"Error during upload: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python upload.py <app_name> <file_path> [icon_path]")
        sys.exit(1)
    
    name = sys.argv[1]
    f_path = sys.argv[2]
    i_path = sys.argv[3] if len(sys.argv) > 3 else None
    
    upload_app(name, f_path, i_path)
