import sys
import os
from sqlalchemy import text

# Add the backend directory to sys.path to import modules
sys.path.append(os.path.abspath("backend"))

from database import engine

def check_columns():
    try:
        with engine.connect() as conn:
            # Query for column names in the users table
            result = conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'users'
            """))
            columns = result.fetchall()
            print("Columns in 'users' table:")
            for col in columns:
                print(f"- {col[0]} ({col[1]})")
    except Exception as e:
        print(f"Error checking columns: {e}")

if __name__ == "__main__":
    check_columns()
