import sqlite3
conn = sqlite3.connect('backend/appstore.db')
cursor = conn.cursor()
cursor.execute("SELECT id, name, file_path, developer FROM apps WHERE name LIKE '%Apex%'")
print(cursor.fetchall())
conn.close()
