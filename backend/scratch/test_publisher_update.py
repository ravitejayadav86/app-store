import sys
import os

# Add the backend directory to sys.path to import modules
sys.path.append(os.path.abspath("backend"))

from database import SessionLocal
import models

db = SessionLocal()
try:
    user = db.query(models.User).filter(models.User.username == "ravitejaraviteja666962c").first()
    if user:
        print(f"Found user: {user.username}")
        user.is_publisher = True
        db.commit()
        db.refresh(user)
        print(f"User {user.username} is now publisher: {user.is_publisher}")
        # Reset it back to test the API route later
        user.is_publisher = False
        db.commit()
        print("Reset user status for testing API.")
    else:
        print("User not found.")
finally:
    db.close()
