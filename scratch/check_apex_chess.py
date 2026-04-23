import sqlite3
import os

db_path = 'backend/appstore.db'
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Searching for 'Apex chess'...")
cursor.execute("SELECT id, name, file_path, icon_url, developer FROM apps WHERE name LIKE ?", ('%Apex chess%',))
results = cursor.fetchall()

if not results:
    print("No app found with name 'Apex chess'. Listing all apps:")
    cursor.execute("SELECT id, name, file_path, icon_url, developer FROM apps")
    results = cursor.fetchall()

for row in results:
    print(f"ID: {row[0]}, Name: {row[1]}, File: {row[2]}, Icon: {row[3]}, Developer: {row[4]}")

conn.close()
