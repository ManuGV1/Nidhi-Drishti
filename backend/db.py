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
    state_name = Column(String(100), nullable=False)

class LgdDistrictModel(Base):
    __tablename__ = 'lgd_districts'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    district_code = Column(Integer, primary_key=True)
    state_code = Column(Integer, nullable=False)
    district_name = Column(String(100), nullable=False)

class LgdConstituencyModel(Base):
    __tablename__ = 'lgd_constituencies'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    constituency_code = Column(Integer, primary_key=True)
    state_code = Column(Integer, nullable=False)
    constituency_name = Column(String(100), nullable=False)

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
    nirikshan_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_description = Column(Text)
    activity_name = Column(Text)
    work_category = Column(String(100))
    state_name = Column(String(100))
    constituency = Column(String(100))
    ida_name = Column(String(200))
    mp_name = Column(String(200))
    recommended_amount = Column(Float)
    work_stage = Column(String(50))
    recommendation_date = Column(Date)

class NirikshanCompletedModel(Base):
    __tablename__ = 'nirikshan_completed'
    __table_args__ = {'schema': 'public', 'extend_existing': True}
    nirikshan_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_description = Column(Text)
    activity_name = Column(Text)
    work_category = Column(String(100))
    state_name = Column(String(100))
    constituency = Column(String(100))
    ida_name = Column(String(200))
    mp_name = Column(String(200))
    actual_amount = Column(Float)
    actual_end_date = Column(Date)

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

def init_db():
    """Hook to automatically create missing tables on startup using Base.metadata.create_all(bind=engine)."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialization: Base.metadata.create_all execution completed.")
    except Exception as e:
        logger.warning(f"Database initialization warning: {e}")

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
