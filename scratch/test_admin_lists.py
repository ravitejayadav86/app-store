import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.abspath('c:/Users/ravit/OneDrive/Desktop/app-store/backend'))

try:
    from database import SessionLocal
    import models
    import schemas
    from typing import List

    db = SessionLocal()
    
    print("--- Testing /admin/pending ---")
    pending = db.query(models.App).filter(models.App.is_approved == False).all()
    # Validate against schema
    validated_pending = [schemas.AppOut.from_orm(app) for app in pending]
    print(f"Validated {len(validated_pending)} pending apps.")
    
    print("\n--- Testing /admin/published ---")
    published = db.query(models.App).filter(models.App.is_approved == True, models.App.is_active == True).all()
    # Validate against schema
    validated_published = [schemas.AppOut.from_orm(app) for app in published]
    print(f"Validated {len(validated_published)} published apps.")
    
    db.close()
    print("\nAll endpoints logic OK.")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
