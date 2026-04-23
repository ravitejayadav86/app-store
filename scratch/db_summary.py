import sqlite3
conn = sqlite3.connect('backend/appstore.db')
cursor = conn.cursor()

tables = ['users', 'apps', 'purchases', 'reviews', 'notifications', 'posts', 'follows', 'messages']
for table in tables:
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"Table {table}: {count} rows")
    except Exception as e:
        print(f"Table {table}: Error {e}")

conn.close()
