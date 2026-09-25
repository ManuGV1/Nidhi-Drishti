"""
NIDHIDRISHTI — Database Connection Management
"""

import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from backend.config import DB_URL, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

def get_db_connection():
    """Returns a new psycopg2 connection to nidhidrishti DB."""
    if DB_URL:
        conn_url = DB_URL
        if conn_url.startswith("postgres://"):
            conn_url = conn_url.replace("postgres://", "postgresql://", 1)
        return psycopg2.connect(conn_url)
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
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
