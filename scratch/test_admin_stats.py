import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.abspath('c:/Users/ravit/OneDrive/Desktop/app-store/backend'))

try:
    from database import SessionLocal
    import models
    from sqlalchemy import func
    import os as os_lib

    db = SessionLocal()
    
    # Simulate require_admin
    # We just need the db session
    
    print("Checking get_dashboard_stats logic...")
    
    total_users = db.query(models.User).count()
    total_apps = db.query(models.App).count()
    approved_apps = db.query(models.App).filter(models.App.is_approved == True).count()
    pending_apps = db.query(models.App).filter(models.App.is_approved == False).count()
    total_downloads = db.query(models.Purchase).count()
    total_reviews = db.query(models.Review).count()
    total_publishers = db.query(models.User).filter(models.User.is_publisher == True).count()
    total_posts = db.query(models.Post).count()

    revenue_result = db.query(func.sum(models.App.price)).join(
        models.Purchase, models.Purchase.app_id == models.App.id
    ).scalar()
    
    print(f"Revenue Result: {revenue_result}")
    total_revenue = round(float(revenue_result or 0), 2)
    print(f"Total Revenue: {total_revenue}")

    all_apps = db.query(models.App).filter(models.App.file_path != None).all()
    missing_files = 0
    for app in all_apps:
        if app.file_path and app.file_path.startswith("/uploads/"):
            path_to_check = app.file_path.lstrip("/")
            if not os_lib.path.exists(path_to_check):
                missing_files += 1
    
    print(f"Missing Files: {missing_files}")
    
    db.close()
    print("Logic OK")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
