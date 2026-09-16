"""
NIDHIDRISHTI — Pydantic Request & Response Schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import date, datetime

# 1. Overview KPI Schema
class OverviewResponse(BaseModel):
    total_recommended_works: int
    total_completed_works: int
    total_allocation_inr: float
    total_expenditure_inr: float
    total_states_count: int
    total_districts_count: int
    high_risk_count: int
    critical_risk_count: int

# 2. Paginated Response Wrapper
class PaginatedResponse(BaseModel):
    total_records: int
    page: int
    limit: int
    total_pages: int
    data: List[Any]

# 3. Work Schema
class WorkDetail(BaseModel):
    work_type: str
    id: int
    work_title: str
    category: Optional[str] = None
    state_name: str
    constituency_name: str
    ida_name: str
    mp_name: str
    amount: float
    status: Optional[str] = None
    recommended_date: Optional[date] = None
    completed_date: Optional[date] = None
    source_file: str

# 4. Risk Result Schema
class RiskResultDetail(BaseModel):
    anomaly_id: int
    run_id: Optional[str] = None
    work_type: str
    source_row_id: Optional[int] = None
    work_id: Optional[int] = None
    nirikshan_id: Optional[int] = None
    nirikshan_completed_id: Optional[int] = None
    source_dataset: Optional[str] = None
    risk_score: float
    risk_level: str
    risk_category: str
    reason_codes: List[str]
    evidence_json: Dict[str, Any]
    feature_values_json: Dict[str, Any]
    peer_stats_json: Dict[str, Any]
    detector_version: str
    calculated_at: datetime
    work_title: Optional[str] = None
    state_name: Optional[str] = None
    constituency_name: Optional[str] = None
    amount: Optional[float] = None

# 5. Sandbox Hypothetical Request / Response (Stateless)
class SandboxEvaluateRequest(BaseModel):
    work_title: str
    category: str
    state_name: str
    constituency_name: str
    allocation_amount: float
    recommended_date: Optional[date] = None
    work_status: Optional[str] = "RECOMMENDED"

class SandboxEvaluateResponse(BaseModel):
    is_hypothetical: bool = True
    persisted_to_db: bool = False
    risk_score: float
    risk_level: str
    risk_category: str
    reason_codes: List[str]
    evidence_json: Dict[str, Any]
    feature_values_json: Dict[str, Any]
    peer_stats_json: Dict[str, Any]

# 6. Investigation Case Request / Response
class CreateCaseRequest(BaseModel):
    work_type: str
    source_row_id: Optional[int] = None
    work_id: Optional[int] = None
    nirikshan_id: Optional[int] = None
    nirikshan_completed_id: Optional[int] = None
    priority: Optional[str] = "MEDIUM"
    assigned_to: Optional[str] = None

class UpdateCaseRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    note_text: Optional[str] = None

class CaseDetail(BaseModel):
    case_id: int
    case_number: str
    work_type: str
    source_row_id: Optional[int] = None
    work_id: Optional[int] = None
    nirikshan_id: Optional[int] = None
    nirikshan_completed_id: Optional[int] = None
    risk_score: float
    risk_level: str
    status: str
    priority: str
    assigned_to: Optional[str] = None
    signals_summary: Optional[Any] = None
    created_at: datetime
    updated_at: datetime
