"""
NIDHIDRISHTI — Investigation Case Management Router
GET /api/investigations, POST /api/investigations, PATCH /api/investigations/{case_id}
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
import datetime
import psycopg2.extras
from backend.db import get_db_cursor
from backend.schemas import CreateCaseRequest, UpdateCaseRequest, CaseDetail

router = APIRouter(prefix="/api/investigations", tags=["Investigation Center"])

@router.get("", response_model=List[CaseDetail])
def get_cases(status: Optional[str] = Query(None, regex="^(OPEN|UNDER_REVIEW|VERIFIED|DISMISSED|ESCALATED)$")):
    with get_db_cursor() as cur:
        if status:
            cur.execute("SELECT * FROM public.investigation_cases WHERE status = %s ORDER BY case_id DESC;", (status,))
        else:
            cur.execute("SELECT * FROM public.investigation_cases ORDER BY case_id DESC;")
        rows = cur.fetchall()

    return [CaseDetail(**r) for r in rows]

@router.post("", response_model=CaseDetail)
def create_case(payload: CreateCaseRequest):
    with get_db_cursor(commit=True) as cur:
        # Check risk score from risk_anomaly_results
        if payload.work_type == "RECOMMENDED":
            cur.execute("SELECT risk_score, risk_level, reason_codes FROM public.risk_anomaly_results WHERE source_row_id = %s;", (payload.source_row_id,))
        else:
            cur.execute("SELECT risk_score, risk_level, reason_codes FROM public.risk_anomaly_results WHERE work_id = %s;", (payload.work_id,))
        risk_info = cur.fetchone()

        score = float(risk_info["risk_score"]) if risk_info else 50.0
        level = risk_info["risk_level"] if risk_info else "MEDIUM"
        signals = risk_info["reason_codes"] if risk_info else []

        case_num = f"CASE-{datetime.datetime.now().strftime('%Y%m%d')}-{int(datetime.datetime.now().timestamp()) % 10000:04d}"

        cur.execute("""
            INSERT INTO public.investigation_cases (
                case_number, work_type, source_row_id, work_id, risk_score, risk_level,
                status, priority, assigned_to, signals_summary
            ) VALUES (%s, %s, %s, %s, %s, %s, 'OPEN', %s, %s, %s)
            RETURNING *;
        """, (
            case_num, payload.work_type, payload.source_row_id, payload.work_id,
            score, level, payload.priority, payload.assigned_to, psycopg2.extras.Json(signals)
        ))
        row = cur.fetchone()

    return CaseDetail(**row)

@router.patch("/{case_id}", response_model=CaseDetail)
def update_case(case_id: int, payload: UpdateCaseRequest):
    with get_db_cursor(commit=True) as cur:
        cur.execute("SELECT * FROM public.investigation_cases WHERE case_id = %s;", (case_id,))
        case = cur.fetchone()
        if not case:
            raise HTTPException(status_code=404, detail="Investigation case not found.")

        updates = []
        params = []
        if payload.status:
            updates.append("status = %s")
            params.append(payload.status)
        if payload.priority:
            updates.append("priority = %s")
            params.append(payload.priority)
        if payload.assigned_to is not None:
            updates.append("assigned_to = %s")
            params.append(payload.assigned_to)

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            sql = f"UPDATE public.investigation_cases SET {', '.join(updates)} WHERE case_id = %s RETURNING *;"
            params.append(case_id)
            cur.execute(sql, params)
            case = cur.fetchone()

        if payload.note_text:
            cur.execute("""
                INSERT INTO public.investigation_notes (case_id, author, note_text, action_taken)
                VALUES (%s, %s, %s, %s);
            """, (case_id, payload.assigned_to or "SYSTEM_OFFICER", payload.note_text, payload.status))

    return CaseDetail(**case)
