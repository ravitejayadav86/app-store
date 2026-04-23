from database import engine
from sqlalchemy import text

def add_column():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE follows ADD COLUMN is_accepted BOOLEAN DEFAULT TRUE"))
            conn.commit()
            print("Successfully added 'is_accepted' column to 'follows' table.")
        except Exception as e:
            if "already exists" in str(e):
                print("Column 'is_accepted' already exists.")
            else:
                print(f"Error: {e}")

if __name__ == "__main__":
    add_column()
