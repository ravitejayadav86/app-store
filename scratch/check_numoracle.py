import sqlite3
import os

db_path = "backend/appstore.db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Search for NumOracle in the apps table
cursor.execute("SELECT * FROM apps WHERE name LIKE '%NumOracle%'")
apps = cursor.fetchall()

if apps:
    print(f"Found {len(apps)} apps matching 'NumOracle':")
    for app in apps:
        print(app)
else:
    print("No apps found matching 'NumOracle'.")

conn.close()
