import sqlite3
import os

db_path = 'backend/appstore.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Schema for 'apps' table:")
cursor.execute("PRAGMA table_info(apps)")
for row in cursor.fetchall():
    print(row)

print("\nListing all apps with available columns:")
cursor.execute("SELECT * FROM apps")
rows = cursor.fetchall()
colnames = [description[0] for description in cursor.description]
print(colnames)

for row in rows:
    print(row)

conn.close()
