
import os
import sys

# Add backend to path so we can import database and models
backend_path = os.path.abspath("backend")
if backend_path not in sys.path:
    sys.path.append(backend_path)

from database import SessionLocal
import models

def fix_test_app():
    # Set DB URL if not set
    if not os.getenv("DATABASE_URL"):
        os.environ["DATABASE_URL"] = "sqlite:///backend/appstore.db"
    
    db = SessionLocal()
    try:
        # Create uploads folder if it doesn't exist
        uploads_dir = os.path.join("backend", "uploads")
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
            
        # Create dummy file
        dummy_file_path = os.path.join(uploads_dir, "test_app.zip")
        with open(dummy_file_path, "w") as f:
            f.write("This is a dummy test app for download testing.")
        
        # Find apps that have no file_path
        apps = db.query(models.App).filter(models.App.file_path == None).all()
        
        if not apps:
            print("No apps found with missing file paths.")
            return

        for app in apps:
            app.file_path = "uploads/test_app.zip"
            print(f"Updated app: {app.name} (ID: {app.id}) with dummy file path.")
        
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_test_app()
