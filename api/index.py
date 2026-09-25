import sys
import os

# Ensure backend modules can be imported by adding project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
