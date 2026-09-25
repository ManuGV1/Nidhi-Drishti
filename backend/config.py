"""
NIDHIDRISHTI — Backend Configuration
"""

import os

def get_db_url() -> str:
    """Dynamically resolves PostgreSQL connection URL from environment variables."""
    url = (
        os.getenv("DATABASE_URL")
        or os.getenv("INTERNAL_DATABASE_URL")
        or os.getenv("POSTGRES_URL")
        or os.getenv("POSTGRESQL_URL")
        or ""
    )
    return url.strip()

DB_URL = get_db_url()
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "nidhidrishti")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

APP_NAME = "NIDHIDRISHTI Intelligence API"
APP_VERSION = "v1.0.0"

