"""
NIDHIDRISHTI — Backend Configuration
"""

import os

DB_URL = os.getenv("DATABASE_URL", os.getenv("POSTGRES_URL", ""))
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "nidhidrishti")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

APP_NAME = "NIDHIDRISHTI Intelligence API"
APP_VERSION = "v1.0.0"

