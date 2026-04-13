from database import SessionLocal
import models

def list_all_apps():
    db = SessionLocal()
    try:
        apps = db.query(models.App).all()
        print(f"Total apps in DB: {len(apps)}")
        for app in apps:
            print(f"ID: {app.id} | Name: {app.name} | Approved: {app.is_approved} | Active: {app.is_active}")
    finally:
        db.close()

if __name__ == "__main__":
    list_all_apps()
