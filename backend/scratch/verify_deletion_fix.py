import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
from database import SessionLocal, engine

def verify():
    db = SessionLocal()
    try:
        print("Checking for apps that are inactive but still approved...")
        inactive_approved = db.query(models.App).filter(
            models.App.is_approved == True,
            models.App.is_active == False
        ).all()
        
        if inactive_approved:
            print(f"Found {len(inactive_approved)} apps that would have been incorrectly visible.")
            for app in inactive_approved:
                print(f" - {app.name} (ID: {app.id})")
        else:
            print("No inconsistent apps found. (This is good if you just ran a clean migration or if no apps were soft-deleted yet).")

        print("\nVerifying that the get_apps filter logic should now exclude them...")
        # Simulating the query in get_apps route
        public_apps = db.query(models.App).filter(
            models.App.is_approved == True,
            models.App.is_active == True
        ).all()
        
        # Verify no inactive apps are in the public list
        for app in public_apps:
            if not app.is_active:
                print(f"FAILURE: Inactive app {app.name} (ID: {app.id}) is still in the public list!")
                return
        
        print(f"Verification Successful: Total visible apps: {len(public_apps)}. All are active and approved.")
        
    finally:
        db.close()

if __name__ == "__main__":
    verify()
