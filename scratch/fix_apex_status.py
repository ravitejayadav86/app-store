import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
import models

db = SessionLocal()
try:
    print("Fixing 'Apex chess' status...")
    app = db.query(models.App).filter(models.App.id == 17).first()
    if app:
        app.is_active = True
        app.is_approved = True
        db.commit()
        print(f"App {app.name} (ID: {app.id}) is now active and approved.")
    else:
        print("App with ID 17 not found.")
finally:
    db.close()
