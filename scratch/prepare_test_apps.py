
import sqlite3
import os

def prepare_test_apps():
    # Use absolute paths to avoid relative path issues
    base_dir = r"C:\Users\ravit\OneDrive\Desktop\app-store"
    db_path = os.path.join(base_dir, "backend", "appstore.db")
    uploads_dir = os.path.join(base_dir, "backend", "uploads")
    
    # ensure uploads dir exists
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        print(f"Created directory: {uploads_dir}")

    # create dummy zip file
    dummy_file_path = os.path.join(uploads_dir, "test_app.zip")
    with open(dummy_file_path, "w") as f:
        f.write("This is a dummy application file for testing downloads.")
    print(f"Created dummy file: {dummy_file_path}")

    # Update database
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Give a file to anything with 'Test' in the name or anything with null file_path
        cursor.execute("UPDATE apps SET file_path = 'uploads/test_app.zip' WHERE file_path IS NULL OR name LIKE '%Test%'")
        rows_updated = cursor.rowcount
        conn.commit()
        
        print(f"Successfully updated {rows_updated} apps in the database.")
        
        # Verify
        cursor.execute("SELECT name, file_path FROM apps WHERE file_path IS NOT NULL")
        current_apps = cursor.fetchall()
        print("\nDownloadable apps now:")
        for name, path in current_apps:
            print(f"- {name}: {path}")
            
        conn.close()
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    prepare_test_apps()
