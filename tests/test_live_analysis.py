"""
NIDHIDRISHTI — Unit Tests for Live Risk Analysis & Stateless Sandbox Isolation
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db import get_db_cursor

client = TestClient(app)

def test_sandbox_evaluation_stateless():
    # 1. Count rows in risk_anomaly_results before
    with get_db_cursor() as cur:
        cur.execute("SELECT COUNT(*) AS count FROM public.risk_anomaly_results;")
        count_before = cur.fetchone()["count"]

    # 2. Call Sandbox Endpoint with hypothetical payload
    payload = {
        "work_title": "Construction of Hypothetical Flyover",
        "category": "Roads & Bridges",
        "state_name": "Uttar Pradesh",
        "constituency_name": "Varanasi",
        "allocation_amount": 9999999.0,
        "work_status": "RECOMMENDED"
    }

    response = client.post("/api/risk/sandbox", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_hypothetical"] == True
    assert data["persisted_to_db"] == False
    assert "risk_score" in data

    # 3. Verify ZERO rows were inserted into production DB
    with get_db_cursor() as cur:
        cur.execute("SELECT COUNT(*) AS count FROM public.risk_anomaly_results;")
        count_after = cur.fetchone()["count"]

    assert count_after == count_before
