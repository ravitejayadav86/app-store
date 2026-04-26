import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.abspath('c:/Users/ravit/OneDrive/Desktop/app-store/backend'))

try:
    from database import SessionLocal
    import models

    db = SessionLocal()
    
    print("\n--- Checking for NULL fields in Apps ---")
    apps = db.query(models.App).all()
    for app in apps:
        print(f"ID: {app.id}, Name: {app.name}, Dev: {app.developer}, Cat: {app.category}, Created: {app.created_at}")
        if app.developer is None or app.category is None or app.created_at is None:
            print(f"!!! CRITICAL: Found NULL in required field for ID {app.id}")
            
    db.close()
except Exception as e:
    print(f"Error: {e}")
