from fastapi.testclient import TestClient
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from main import app
from database import SessionLocal, Base, engine
import models

# Create a test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
from sqlalchemy import create_engine
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
test_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# We need to override the dependency
from database import get_db

def override_get_db():
    db = test_SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_download_missing_file():
    # Setup: Create a database record but no physical file
    models.Base.metadata.create_all(bind=test_engine)
    db = test_SessionLocal()
    
    # Clean up previous tests
    db.query(models.App).delete()
    
    test_app = models.App(
        name="Test Missing App",
        description="Test description",
        price=0,
        category="Games",
        version="1.0",
        developer="testuser",
        file_path="uploads/non_existent_file.zip",
        is_active=True,
        is_approved=True
    )
    db.add(test_app)
    db.commit()
    db.refresh(test_app)
    
    print(f"Testing download for App ID: {test_app.id}")
    
    response = client.get(f"/apps/{test_app.id}/download")
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Body: {response.json()}")
    
    assert response.status_code == 404
    assert "was not found on the server's storage" in response.json()['detail']
    
    print("Test passed: Correct error returned for missing file.")
    
    db.close()
    # Cleanup test db
    os.remove("./test.db")

if __name__ == "__main__":
    from sqlalchemy.orm import sessionmaker
    test_download_missing_file()
