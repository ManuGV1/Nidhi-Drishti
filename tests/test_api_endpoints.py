"""
NIDHIDRISHTI — Integration Tests for FastAPI Endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "ONLINE"

def test_overview_endpoint():
    res = client.get("/api/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["total_recommended_works"] == 60359
    assert data["total_completed_works"] == 44028

def test_states_endpoint():
    res = client.get("/api/states")
    assert res.status_code == 200
    states = res.json()
    assert len(states) == 36

def test_works_paginated_endpoint():
    res = client.get("/api/works?page=1&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] == 60359
    assert len(data["data"]) == 10

def test_single_work_endpoint():
    res = client.get("/api/works/1?work_type=RECOMMENDED")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 1

def test_investigations_workflow():
    # 1. Create Case
    payload = {
        "work_type": "RECOMMENDED",
        "source_row_id": 100,
        "priority": "HIGH",
        "assigned_to": "Officer Sharma"
    }
    res_create = client.post("/api/investigations", json=payload)
    assert res_create.status_code == 200
    case_data = res_create.json()
    case_id = case_data["case_id"]
    assert case_data["status"] == "OPEN"

    # 2. Update Case
    update_payload = {
        "status": "UNDER_REVIEW",
        "note_text": "Initiated manual document verification."
    }
    res_update = client.patch(f"/api/investigations/{case_id}", json=update_payload)
    assert res_update.status_code == 200
    updated_data = res_update.json()
    assert updated_data["status"] == "UNDER_REVIEW"
