import sys
import os

# Add the backend directory to the path so we can import modules
sys.path.append(os.path.abspath('c:/Users/ravit/OneDrive/Desktop/app-store/backend'))

try:
    from database import SessionLocal
    import models
    from sqlalchemy import func

    db = SessionLocal()
    print("Database connection: OK")
    
    user_count = db.query(models.User).count()
    print(f"User count: {user_count}")
    
    app_count = db.query(models.App).count()
    print(f"App count: {app_count}")
    
    revenue = db.query(func.sum(models.App.price)).join(
        models.Purchase, models.Purchase.app_id == models.App.id
    ).scalar()
    print(f"Revenue: {revenue}")
    
    db.close()
    print("Database check complete.")
except Exception as e:
    print(f"Error checking database: {e}")
