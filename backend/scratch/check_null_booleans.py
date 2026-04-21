import sys
import os
from sqlalchemy import text

# Add the backend directory to sys.path to import modules
sys.path.append(os.path.abspath("backend"))

from database import engine

def check_nulls():
    try:
        with engine.connect() as conn:
            # Check for NULL values in critical boolean columns
            result = conn.execute(text("""
                SELECT username, is_publisher, is_admin, is_active, is_private 
                FROM users 
                WHERE is_publisher IS NULL 
                   OR is_admin IS NULL 
                   OR is_active IS NULL 
                   OR is_private IS NULL
            """))
            nulls = result.fetchall()
            print(f"Users with NULL boolean columns: {len(nulls)}")
            for row in nulls:
                print(f"User: {row[0]}, is_publisher: {row[1]}, is_admin: {row[2]}, is_active: {row[3]}, is_private: {row[4]}")
    except Exception as e:
        print(f"Error checking nulls: {e}")

if __name__ == "__main__":
    check_nulls()
