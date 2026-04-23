import sys
import os
from sqlalchemy import inspect

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import engine

inspector = inspect(engine)
if "apps" in inspector.get_table_names():
    columns = [c["name"] for c in inspector.get_columns("apps")]
    print(f"Columns in 'apps' table on remote DB: {columns}")
else:
    print("Table 'apps' not found on remote DB.")

if "users" in inspector.get_table_names():
    columns = [c["name"] for c in inspector.get_columns("users")]
    print(f"Columns in 'users' table on remote DB: {columns}")
