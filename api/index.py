import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
# Add the backend directory to sys.path so its internal imports work
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from backend.main import app
