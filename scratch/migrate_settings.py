import sqlite3
import os

db_path = "backend/appstore.db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

columns_to_add = [
    ("billing_address", "TEXT"),
    ("payment_method", "TEXT"),
    ("biometric_enabled", "BOOLEAN DEFAULT 0"),
    ("safe_browsing", "BOOLEAN DEFAULT 1"),
    ("auto_update", "TEXT DEFAULT 'Over Wi-Fi only'"),
    ("download_pref", "TEXT DEFAULT 'Ask every time'")
]

for col_name, col_type in columns_to_add:
    try:
        cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
        print(f"Added column: {col_name}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"Column {col_name} already exists.")
        else:
            print(f"Error adding {col_name}: {e}")

conn.commit()
conn.close()
print("Migration completed.")
