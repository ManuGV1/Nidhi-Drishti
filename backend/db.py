"""
NIDHIDRISHTI — Database Connection Management & Table Hook
"""

import os
import logging
import datetime
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from sqlalchemy import (
    create_engine, Column, Integer, BigInteger, String, Float, Text, Date, DateTime, JSON
)
from sqlalchemy.orm import declarative_base
from backend.config import get_db_url

logger = logging.getLogger("nidhidrishti.db")

# 1. SQLAlchemy Engine & Declarative Base setup
def get_sqlalchemy_engine():
    db_url = get_db_url()
    if db_url:
        conn_url = db_url
        # Normalize Render's "postgres://" shorthand
        if conn_url.startswith("postgres://"):
            conn_url = conn_url.replace("postgres://", "postgresql://", 1)
        # Explicitly force psycopg2 dialect so SQLAlchemy 2.x doesn't try to
        # import the missing psycopg (psycopg3) driver.
        if conn_url.startswith("postgresql://") and "+psycopg" not in conn_url:
            conn_url = conn_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return create_engine(conn_url, pool_pre_ping=True)

    db_host = os.getenv("DB_HOST", "localhost")
    db_port = int(os.getenv("DB_PORT", "5432"))
    db_name = os.getenv("DB_NAME", "nidhidrishti")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "")
    dev_url = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    return create_engine(dev_url, pool_pre_ping=True)

engine = get_sqlalchemy_engine()
Base = declarative_base()

# Declarative Model Schemas for automatic creation
class LgdStateModel(Base):
    __tablename__ = 'lgd_states'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    state_code = Column(Integer, primary_key=True)
    state_name_english = Column(String(100), nullable=False)
    state_name_local = Column(String(150))
    state_census2011_code = Column(Integer)
    state_or_ut = Column(String(10))
    last_updated = Column(Date)
    source_file = Column(String(255), default='04_lgd_states.csv')
    ingested_at = Column(DateTime, default=datetime.datetime.utcnow)

class LgdDistrictModel(Base):
    __tablename__ = 'lgd_districts'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    district_code = Column(Integer, primary_key=True)
    state_code = Column(Integer, nullable=False)
    district_name_english = Column(String(150), nullable=False)
    district_name_local = Column(String(200))
    district_census2011_code = Column(Integer)
    source_file = Column(String(255), default='03_lgd_districts.csv')
    ingested_at = Column(DateTime, default=datetime.datetime.utcnow)

class LgdSubdistrictModel(Base):
    __tablename__ = 'lgd_subdistricts'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    subdistrict_code = Column(Integer, primary_key=True)
    district_code = Column(Integer, nullable=False)
    state_code = Column(Integer, nullable=False)
    subdistrict_name_english = Column(String(150), nullable=False)
    subdistrict_name_local = Column(String(200))
    source_file = Column(String(255), default='05_lgd_subdistricts.csv')
    ingested_at = Column(DateTime, default=datetime.datetime.utcnow)

class WorkRecommendedModel(Base):
    __tablename__ = 'works_all'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    source_row_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_title = Column(Text)
    category = Column(String(100))
    state_name = Column(String(100))
    constituency_name = Column(String(100))
    ida_name = Column(String(200))
    mp_name = Column(String(200))
    allocation_amount = Column(Float)
    work_status = Column(String(50))
    recommended_date = Column(Date)
    source_file = Column(String(100))

class WorkCompletedModel(Base):
    __tablename__ = 'works_completed'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    work_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_description = Column(Text)
    category = Column(String(100))
    state_name = Column(String(100))
    constituency_name = Column(String(100))
    ida_name = Column(String(200))
    mp_name = Column(String(200))
    final_amount = Column(Float)
    completed_date = Column(Date)
    source_file = Column(String(100))

class NirikshanRecommendedModel(Base):
    __tablename__ = 'nirikshan_recommended'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    nirikshan_id        = Column(BigInteger, primary_key=True, autoincrement=True)
    recommendation_detail_id = Column(Text)
    work_id             = Column(Text)
    activity_name       = Column(Text)
    work_description    = Column(Text)
    work_category       = Column(String(100))
    state_name          = Column(String(100))
    constituency        = Column(String(100))
    constituency_id     = Column(Text)
    house_of_parliament = Column(Text)
    tenure              = Column(Text)
    mp_name             = Column(String(200))
    ida_name            = Column(String(200))
    letter_no           = Column(Text)
    recommendation_date = Column(Date)
    recommended_amount  = Column(Float)
    sanction_date       = Column(Date)
    sanction_amount     = Column(Float)
    work_stage          = Column(String(50))
    flag                = Column(Text)
    house_code          = Column(Integer)
    source_file         = Column(String(255), nullable=False)
    source_row_number   = Column(Integer, nullable=False)
    ingested_at         = Column(DateTime, default=datetime.datetime.utcnow)

class NirikshanCompletedModel(Base):
    __tablename__ = 'nirikshan_completed'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    nirikshan_id        = Column(BigInteger, primary_key=True, autoincrement=True)
    recommendation_detail_id = Column(Text)
    work_id             = Column(Text)
    activity_name       = Column(Text)
    work_description    = Column(Text)
    work_category       = Column(String(100))
    state_name          = Column(String(100))
    constituency        = Column(String(100))
    constituency_id     = Column(Text)
    house_of_parliament = Column(Text)
    tenure              = Column(Text)
    mp_name             = Column(String(200))
    ida_name            = Column(String(200))
    letter_no           = Column(Text)
    recommendation_date = Column(Date)
    recommended_amount  = Column(Float)
    sanction_date       = Column(Date)
    sanction_amount     = Column(Float)
    actual_end_date     = Column(Date)
    actual_amount       = Column(Float)
    flag                = Column(Text)
    house_code          = Column(Integer)
    source_file         = Column(String(255), nullable=False)
    source_row_number   = Column(Integer, nullable=False)
    ingested_at         = Column(DateTime, default=datetime.datetime.utcnow)

class RiskAnomalyResultModel(Base):
    __tablename__ = 'risk_anomaly_results'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    anomaly_id = Column(BigInteger, primary_key=True, autoincrement=True)
    run_id = Column(String(100))
    work_type = Column(String(50))
    source_row_id = Column(BigInteger)
    work_id = Column(BigInteger)
    nirikshan_id = Column(BigInteger)
    nirikshan_completed_id = Column(BigInteger)
    source_dataset = Column(String(50), default='MPLADS')
    risk_score = Column(Float)
    risk_level = Column(String(20))
    risk_category = Column(String(100))
    reason_codes = Column(JSON)
    evidence_json = Column(JSON)
    feature_values_json = Column(JSON)
    peer_stats_json = Column(JSON)
    detector_version = Column(String(20), default='1.0')
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow)

class RiskResultModel(Base):
    __tablename__ = 'risk_results'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    risk_score = Column(Float)
    risk_level = Column(String(20))
    risk_category = Column(String(100))
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class InvestigationCaseModel(Base):
    __tablename__ = 'investigation_cases'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    case_id = Column(BigInteger, primary_key=True, autoincrement=True)
    case_number = Column(String(100), unique=True)
    work_type = Column(String(50))
    source_row_id = Column(BigInteger)
    work_id = Column(BigInteger)
    nirikshan_id = Column(BigInteger)
    nirikshan_completed_id = Column(BigInteger)
    risk_score = Column(Float)
    risk_level = Column(String(20))
    status = Column(String(50), default='OPEN')
    priority = Column(String(20), default='MEDIUM')
    assigned_to = Column(String(100))
    signals_summary = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class InvestigationNoteModel(Base):
    __tablename__ = 'investigation_notes'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    note_id = Column(BigInteger, primary_key=True, autoincrement=True)
    case_id = Column(BigInteger)
    author = Column(String(100))
    note_text = Column(Text)
    action_taken = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def _is_database_seeded() -> tuple[int, int]:
    """Fast count check — returns (works_cnt, risk_cnt). Never raises."""
    works_cnt, risk_cnt = 0, 0
    try:
        with get_db_cursor() as cur:
            cur.execute("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'works_all'
                );
            """)
            if cur.fetchone()['exists']:
                cur.execute("SELECT COUNT(*) AS cnt FROM public.works_all;")
                works_cnt = cur.fetchone()['cnt']

            cur.execute("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'risk_anomaly_results'
                );
            """)
            if cur.fetchone()['exists']:
                cur.execute("SELECT COUNT(*) AS cnt FROM public.risk_anomaly_results;")
                risk_cnt = cur.fetchone()['cnt']
    except Exception as check_err:
        logger.warning(f"Database count check notice: {check_err}")
    return works_cnt, risk_cnt


def _run_background_seed():
    """
    Heavy seeding pipeline — runs in a daemon thread so FastAPI startup
    returns immediately. Each step is wrapped in its own try-except so a
    single failure does not abort the rest.
    """
    logger.info("[BG-SEED] Background seeding thread started.")

    try:
        from scripts.load_database import load_data
        load_data()
        logger.info("[BG-SEED] load_data() completed.")
    except Exception as e:
        logger.warning(f"[BG-SEED] Dataset load notice: {e}")

    try:
        from scripts.load_nirikshan import main as load_nirikshan_main
        load_nirikshan_main()
        logger.info("[BG-SEED] load_nirikshan completed.")
    except Exception as e:
        logger.warning(f"[BG-SEED] Nirikshan load notice: {e}")

    try:
        from scripts.migrate_risk_schema import migrate_risk_schema
        migrate_risk_schema()
        logger.info("[BG-SEED] migrate_risk_schema completed.")
    except Exception as e:
        logger.warning(f"[BG-SEED] Schema migration notice: {e}")

    try:
        from ml.pipeline import run_intelligence_pipeline
        run_id, summary = run_intelligence_pipeline()
        logger.info(f"[BG-SEED] ML pipeline completed. Run ID: {run_id}")
    except Exception as e:
        logger.warning(f"[BG-SEED] ML Pipeline execution notice: {e}")

    logger.info("[BG-SEED] Background seeding thread finished.")


def ensure_database_seeded():
    """
    FastAPI startup hook.

    Synchronous (fast) phase:
      1. Run Base.metadata.create_all() to create missing tables (DDL only).
      2. Count rows in works_all and risk_anomaly_results.
      3. If both are populated → return immediately (< 10 ms on Render restarts).

    Asynchronous (background) phase:
      4. If the database is empty, launch _run_background_seed() in a
         daemon thread so the startup event returns without blocking Uvicorn's
         health-check timeout.
    """
    import threading

    # ── Step 1: DDL (fast — creates tables, skips if already exist) ──────────
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Base.metadata.create_all completed.")
    except Exception as table_err:
        logger.warning(f"Table DDL creation notice: {table_err}")

    # ── Step 2: Count check (fast) ────────────────────────────────────────────
    works_cnt, risk_cnt = _is_database_seeded()

    if works_cnt > 0 and risk_cnt > 0:
        logger.info(
            f"Database already seeded ({works_cnt} works, {risk_cnt} risk results). "
            "Startup complete."
        )
        return

    # ── Step 3: Background seeding (non-blocking) ─────────────────────────────
    logger.info(
        "Database appears empty — launching background seeding thread. "
        "FastAPI will serve requests immediately; data will be available "
        "once seeding completes."
    )
    t = threading.Thread(target=_run_background_seed, daemon=True, name="db-seed")
    t.start()


def init_db():
    """Alias kept for backward compatibility."""
    ensure_database_seeded()

# 2. Existing psycopg2 Raw SQL helper functions
def get_db_connection():
    """Returns a new psycopg2 connection to nidhidrishti DB.
    Prioritizes production DATABASE_URL over localhost development defaults.
    """
    db_url = get_db_url()
    if db_url:
        conn_url = db_url
        if conn_url.startswith("postgres://"):
            conn_url = conn_url.replace("postgres://", "postgresql://", 1)
        return psycopg2.connect(conn_url)

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
