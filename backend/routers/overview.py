"""
NIDHIDRISHTI — Overview Router
GET /api/overview
"""

import time
from fastapi import APIRouter
from backend.db import get_db_cursor
from backend.schemas import OverviewResponse

router = APIRouter(prefix="/api/overview", tags=["Overview"])

_DEFAULT_DATA = OverviewResponse(
    total_recommended_works=60359,
    total_completed_works=44028,
    total_allocation_inr=34982467506.0,
    total_expenditure_inr=24086877004.61,
    total_states_count=36,
    total_districts_count=785,
    high_risk_count=10625,
    critical_risk_count=1446
)

_CACHE_DATA = _DEFAULT_DATA
_CACHE_TIME = time.time()
_CACHE_TTL = 300.0  # Cache for 5 minutes

@router.get("", response_model=OverviewResponse)
def get_overview_statistics():
    global _CACHE_DATA, _CACHE_TIME
    now = time.time()
    if _CACHE_DATA and (now - _CACHE_TIME) < _CACHE_TTL:
        return _CACHE_DATA

    with get_db_cursor() as cur:
        # Total Recommended Works & Allocation
        cur.execute("SELECT COUNT(*) AS count, COALESCE(SUM(allocation_amount), 0) AS total_amt FROM public.works_all;")
        rec_stats = cur.fetchone()

        # Total Completed Works & Expenditure
        cur.execute("SELECT COUNT(*) AS count, COALESCE(SUM(final_amount), 0) AS total_amt FROM public.works_completed;")
        comp_stats = cur.fetchone()

        # Geography counts
        cur.execute("SELECT COUNT(*) AS count FROM public.lgd_states;")
        states_cnt = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM public.lgd_districts;")
        districts_cnt = cur.fetchone()["count"]

        # Risk Counts
        cur.execute("SELECT COUNT(*) AS count FROM public.risk_anomaly_results WHERE risk_level = 'HIGH';")
        high_risk_cnt = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM public.risk_anomaly_results WHERE risk_level = 'CRITICAL';")
        critical_risk_cnt = cur.fetchone()["count"]

    response = OverviewResponse(
        total_recommended_works=rec_stats["count"],
        total_completed_works=comp_stats["count"],
        total_allocation_inr=float(rec_stats["total_amt"]),
        total_expenditure_inr=float(comp_stats["total_amt"]),
        total_states_count=states_cnt,
        total_districts_count=districts_cnt,
        high_risk_count=high_risk_cnt,
        critical_risk_count=critical_risk_cnt
    )
    _CACHE_DATA = response
    _CACHE_TIME = now
    return response

