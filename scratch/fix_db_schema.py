import sqlite3
import os

db_path = 'backend/appstore.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check apps table
cursor.execute("PRAGMA table_info(apps)")
columns = [row[1] for row in cursor.fetchall()]

migrations = [
    ("icon_url", "TEXT"),
    ("screenshot_urls", "TEXT")
]

for col, col_type in migrations:
    if col not in columns:
        print(f"Adding column {col} to apps table...")
        cursor.execute(f"ALTER TABLE apps ADD COLUMN {col} {col_type}")
    else:
        print(f"Column {col} already exists in apps table.")

# Check users table
cursor.execute("PRAGMA table_info(users)")
columns = [row[1] for row in cursor.fetchall()]

user_migrations = [
    ("is_private", "BOOLEAN DEFAULT FALSE"),
    ("is_publisher", "BOOLEAN DEFAULT FALSE"),
    ("bio", "TEXT"),
    ("avatar_url", "TEXT"),
    ("full_name", "TEXT"),
    ("biometric_enabled", "BOOLEAN DEFAULT FALSE"),
    ("safe_browsing", "BOOLEAN DEFAULT TRUE"),
    ("auto_update", "TEXT DEFAULT 'Over Wi-Fi only'"),
    ("download_pref", "TEXT DEFAULT 'Ask every time'"),
    ("billing_address", "TEXT"),
    ("payment_method", "VARCHAR")
]

for col, col_type in user_migrations:
    if col not in columns:
        print(f"Adding column {col} to users table...")
        cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {col_type}")
    else:
        print(f"Column {col} already exists in users table.")

conn.commit()
conn.close()
print("Migration completed successfully.")
