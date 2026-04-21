import sys
import os
from sqlalchemy import text

# Add the backend directory to sys.path to import modules
sys.path.append(os.path.abspath("backend"))

from database import engine

def run_migrations():
    # Individual transactions for each column/table to avoid transaction abortion
    
    # Columns to add to users table
    user_cols = [
        ("is_private", "BOOLEAN DEFAULT FALSE"),
        ("is_publisher", "BOOLEAN DEFAULT FALSE"),
        ("bio", "TEXT"),
        ("public_key", "TEXT"),
        ("avatar_url", "TEXT"),
        ("full_name", "TEXT"),
        ("billing_address", "TEXT"),
        ("payment_method", "TEXT"),
        ("biometric_enabled", "BOOLEAN DEFAULT FALSE"),
        ("safe_browsing", "BOOLEAN DEFAULT TRUE"),
        ("auto_update", "TEXT DEFAULT 'Over Wi-Fi only'"),
        ("download_pref", "TEXT DEFAULT 'Ask every time'"),
    ]

    print("Running migrations...")
    for col, col_type in user_cols:
        try:
            with engine.connect() as conn:
                # Use a fresh connection/transaction for each
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                conn.commit()
                print(f"Added column: {col}")
        except Exception as e:
            # Column likely exists
            print(f"Skipping column {col} (likely already exists)")
            continue

    # Tables to create
    tables = [
        "CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, user_id INTEGER, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())",
        "CREATE TABLE IF NOT EXISTS post_likes (id SERIAL PRIMARY KEY, user_id INTEGER, post_id INTEGER)",
        "CREATE TABLE IF NOT EXISTS post_replies (id SERIAL PRIMARY KEY, user_id INTEGER, post_id INTEGER, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())",
        "CREATE TABLE IF NOT EXISTS follows (id SERIAL PRIMARY KEY, follower_id INTEGER, following_id INTEGER, created_at TIMESTAMPTZ DEFAULT NOW())",
        "CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, sender_id INTEGER, receiver_id INTEGER, content TEXT, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW())",
    ]

    for stmt in tables:
        try:
            with engine.connect() as conn:
                conn.execute(text(stmt))
                conn.commit()
                print(f"Ensured table exists: {stmt.split()[5]}")
        except Exception as e:
            print(f"Error ensuring table: {e}")
            continue

    print("Migrations complete.")

if __name__ == "__main__":
    run_migrations()
