import json
import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import math
from backend.db import get_db_cursor
from backend.schemas import PaginatedResponse, RiskResultDetail

router = APIRouter(prefix="/api/risks", tags=["Risk Intelligence"])

def _parse_json_field(val, fallback):
    if val is None:
        return fallback
    if isinstance(val, (dict, list)):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return fallback
    return fallback

def _format_datetime(dt):
    if dt is None:
        return None
    if isinstance(dt, (datetime.datetime, datetime.date)):
        return dt.isoformat()
    return str(dt)

@router.get("", response_model=PaginatedResponse)
def get_risk_results(
    risk_level: Optional[str] = Query(None, pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$"),
    work_type: Optional[str] = Query(None, pattern="^(RECOMMENDED|COMPLETED|NIRIKSHAN_RECOMMENDED|NIRIKSHAN_COMPLETED)$"),
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    offset = (page - 1) * limit
    where_clauses = []
    params = []

    if risk_level:
        where_clauses.append("r.risk_level = %s")
        params.append(risk_level)
    if work_type:
        where_clauses.append("r.work_type = %s")
        params.append(work_type)
    if category:
        where_clauses.append("r.risk_category ILIKE %s")
        params.append(f"%{category}%")

    where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    with get_db_cursor() as cur:
        count_query = f"SELECT COUNT(*) AS count FROM public.risk_anomaly_results r{where_sql};"
        cur.execute(count_query, params)
        total_records = cur.fetchone()["count"]

        data_query = f"""
            SELECT r.anomaly_id, r.run_id::text, r.work_type, r.source_row_id, r.work_id,
                   r.nirikshan_id, r.nirikshan_completed_id, r.source_dataset,
                   r.risk_score, r.risk_level, r.risk_category, r.reason_codes,
                   r.evidence_json, r.feature_values_json, r.peer_stats_json,
                   r.detector_version, r.calculated_at,
                   COALESCE(w.work_title, wc.work_description, nr.work_description, nc.work_description, nr.activity_name, nc.activity_name) AS work_title,
                   COALESCE(w.state_name, wc.state_name, nr.state_name, nc.state_name) AS state_name,
                   COALESCE(w.constituency_name, wc.constituency_name, nr.constituency, nc.constituency) AS constituency_name,
                   COALESCE(w.allocation_amount, wc.final_amount, nr.recommended_amount, nc.actual_amount) AS amount
            FROM public.risk_anomaly_results r
            LEFT JOIN public.works_all w ON r.source_row_id = w.source_row_id AND r.work_type = 'RECOMMENDED'
            LEFT JOIN public.works_completed wc ON r.work_id = wc.work_id AND r.work_type = 'COMPLETED'
            LEFT JOIN public.nirikshan_recommended nr ON r.nirikshan_id = nr.nirikshan_id AND r.work_type = 'NIRIKSHAN_RECOMMENDED'
            LEFT JOIN public.nirikshan_completed nc ON r.nirikshan_completed_id = nc.nirikshan_id AND r.work_type = 'NIRIKSHAN_COMPLETED'
            {where_sql}
            ORDER BY r.risk_score DESC, r.anomaly_id ASC
            LIMIT %s OFFSET %s;
        """
        cur.execute(data_query, params + [limit, offset])
        rows = cur.fetchall()

    items = []
    for r in rows:
        items.append({
            "anomaly_id": r["anomaly_id"],
            "run_id": r["run_id"],
            "work_type": r["work_type"],
            "source_row_id": r["source_row_id"],
            "work_id": r["work_id"],
            "nirikshan_id": r["nirikshan_id"],
            "nirikshan_completed_id": r["nirikshan_completed_id"],
            "source_dataset": r["source_dataset"],
            "risk_score": float(r["risk_score"]) if r["risk_score"] is not None else 50.0,
            "risk_level": r["risk_level"] or "MEDIUM",
            "risk_category": r["risk_category"] or "General",
            "reason_codes": _parse_json_field(r["reason_codes"], [r["risk_category"] or "COST_OUTLIER"]),
            "evidence_json": _parse_json_field(r["evidence_json"], {}),
            "feature_values_json": _parse_json_field(r["feature_values_json"], {}),
            "peer_stats_json": _parse_json_field(r["peer_stats_json"], {}),
            "detector_version": r["detector_version"] or "1.0",
            "calculated_at": _format_datetime(r["calculated_at"]),
            "work_title": r["work_title"],
            "state_name": r["state_name"],
            "constituency_name": r["constituency_name"],
            "amount": float(r["amount"]) if r["amount"] is not None else 0.0
        })

    total_pages = math.ceil(total_records / limit) if total_records > 0 else 1

    return PaginatedResponse(
        total_records=total_records,
        page=page,
        limit=limit,
        total_pages=total_pages,
        data=items
    )

@router.get("/{id}", response_model=RiskResultDetail)
def get_risk_result_by_id(id: int):
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT r.anomaly_id, r.run_id::text, r.work_type, r.source_row_id, r.work_id,
                   r.nirikshan_id, r.nirikshan_completed_id, r.source_dataset,
                   r.risk_score, r.risk_level, r.risk_category, r.reason_codes,
                   r.evidence_json, r.feature_values_json, r.peer_stats_json,
                   r.detector_version, r.calculated_at,
                   COALESCE(w.work_title, wc.work_description, nr.work_description, nc.work_description, nr.activity_name, nc.activity_name) AS work_title,
                   COALESCE(w.state_name, wc.state_name, nr.state_name, nc.state_name) AS state_name,
                   COALESCE(w.constituency_name, wc.constituency_name, nr.constituency, nc.constituency) AS constituency_name,
                   COALESCE(w.allocation_amount, wc.final_amount, nr.recommended_amount, nc.actual_amount) AS amount
            FROM public.risk_anomaly_results r
            LEFT JOIN public.works_all w ON r.source_row_id = w.source_row_id AND r.work_type = 'RECOMMENDED'
            LEFT JOIN public.works_completed wc ON r.work_id = wc.work_id AND r.work_type = 'COMPLETED'
            LEFT JOIN public.nirikshan_recommended nr ON r.nirikshan_id = nr.nirikshan_id AND r.work_type = 'NIRIKSHAN_RECOMMENDED'
            LEFT JOIN public.nirikshan_completed nc ON r.nirikshan_completed_id = nc.nirikshan_id AND r.work_type = 'NIRIKSHAN_COMPLETED'
            WHERE r.anomaly_id = %s;
        """, (id,))
        r = cur.fetchone()
        if not r:
            raise HTTPException(status_code=404, detail="Risk anomaly result not found.")

    return RiskResultDetail(
        anomaly_id=r["anomaly_id"],
        run_id=r["run_id"],
        work_type=r["work_type"],
        source_row_id=r["source_row_id"],
        work_id=r["work_id"],
        nirikshan_id=r["nirikshan_id"],
        nirikshan_completed_id=r["nirikshan_completed_id"],
        source_dataset=r["source_dataset"],
        risk_score=float(r["risk_score"]) if r["risk_score"] is not None else 50.0,
        risk_level=r["risk_level"] or "MEDIUM",
        risk_category=r["risk_category"] or "General",
        reason_codes=_parse_json_field(r["reason_codes"], [r["risk_category"] or "COST_OUTLIER"]),
        evidence_json=_parse_json_field(r["evidence_json"], {}),
        feature_values_json=_parse_json_field(r["feature_values_json"], {}),
        peer_stats_json=_parse_json_field(r["peer_stats_json"], {}),
        detector_version=r["detector_version"] or "1.0",
        calculated_at=r["calculated_at"] or datetime.datetime.now(),
        work_title=r["work_title"],
        state_name=r["state_name"],
        constituency_name=r["constituency_name"],
        amount=float(r["amount"]) if r["amount"] is not None else 0.0
    )
