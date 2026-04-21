import sqlite3
import os

# Use the database in backend/appstore.db
db_path = "backend/appstore.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Identify the game ID/name accurately
cursor.execute("SELECT id, name FROM apps WHERE name = 'NumOracle' OR id = 1")
app = cursor.fetchone()

if app:
    app_id, app_name = app
    print(f"Removing app: {app_name} (ID: {app_id})")
    
    # 2. Delete associated reviews
    cursor.execute("DELETE FROM reviews WHERE app_id = ?", (app_id,))
    print(f"Deleted reviews for app {app_id}")
    
    # 3. Delete associated purchases
    cursor.execute("DELETE FROM purchases WHERE app_id = ?", (app_id,))
    print(f"Deleted purchases for app {app_id}")
    
    # 4. Delete the app itself
    cursor.execute("DELETE FROM apps WHERE id = ?", (app_id,))
    print(f"Deleted app {app_id} from apps table")
    
    conn.commit()
    print("Removal successful.")
else:
    print("NumOracle not found in local database.")

conn.close()
