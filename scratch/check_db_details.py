import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.abspath('c:/Users/ravit/OneDrive/Desktop/app-store/backend'))

try:
    from database import SessionLocal
    import models
    from sqlalchemy import func

    db = SessionLocal()
    
    print("--- Stats Data ---")
    revenue = db.query(func.sum(models.App.price)).join(
        models.Purchase, models.Purchase.app_id == models.App.id
    ).scalar()
    print(f"Revenue: {revenue}")
    
    print("\n--- Pending Apps ---")
    pending = db.query(models.App).filter(models.App.is_approved == False).all()
    for app in pending:
        print(f"ID: {app.id}, Name: {app.name}, Dev: {app.developer}")
        
    print("\n--- Published Apps ---")
    published = db.query(models.App).filter(models.App.is_approved == True, models.App.is_active == True).all()
    for app in published:
        print(f"ID: {app.id}, Name: {app.name}, Dev: {app.developer}")
        
    db.close()
except Exception as e:
    print(f"Error: {e}")
