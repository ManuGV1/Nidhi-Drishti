"""
NIDHIDRISHTI — Database Connection Management
"""

import os
import logging
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from backend.config import get_db_url

logger = logging.getLogger("nidhidrishti.db")

def get_db_connection():
    """Returns a new psycopg2 connection to nidhidrishti DB.
    Prioritizes production DATABASE_URL over localhost development defaults.
    """
    db_url = get_db_url()
    if db_url:
        conn_url = db_url
        if conn_url.startswith("postgres://"):
            conn_url = conn_url.replace("postgres://", "postgresql://", 1)
        logger.info("Database Connection: Using production DATABASE_URL strategy.")
        return psycopg2.connect(conn_url)

    logger.info("Database Connection: Using development parameter strategy.")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = int(os.getenv("DB_PORT", "5432"))
    db_name = os.getenv("DB_NAME", "nidhidrishti")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "")

    return psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port
    )

@contextmanager
def get_db_cursor(commit: bool = False):
    """Context manager delivering a RealDictCursor with auto-close."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        yield cur
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
