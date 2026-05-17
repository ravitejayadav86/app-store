from database import SessionLocal
from models import App

def list_apps():
    with SessionLocal() as db:
        apps = db.query(App).all()
        for app in apps:
            print(f"ID: {app.id} | Name: {app.name} | Category: {app.category} | Icon: {app.icon_url}")

if __name__ == "__main__":
    list_apps()
