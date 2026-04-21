import sys
import os

# Add the backend directory to sys.path to import modules
sys.path.append(os.path.abspath("backend"))

from database import SessionLocal
import models

db = SessionLocal()
try:
    users = db.query(models.User).all()
    print(f"Total users: {len(users)}")
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, is_publisher: {u.is_publisher}")
finally:
    db.close()
