"""
NIDHIDRISHTI — Live Analysis & Sandbox Evaluator Router
Fulfills separation of real database work evaluation vs stateless hypothetical sandbox.
"""

from fastapi import APIRouter, HTTPException, Query
from backend.db import get_db_cursor
from backend.schemas import SandboxEvaluateRequest, SandboxEvaluateResponse, RiskResultDetail
from ml.peer_benchmarking import compute_group_stats
from ml.financial_anomalies import analyze_financial_anomaly
from ml.text_similarity import evaluate_description_context
from ml.geo_intelligence import evaluate_geo_intelligence
from ml.temporal_analytics import evaluate_temporal_and_status
from ml.risk_fusion import fuse_risk_scores

router = APIRouter(prefix="/api/risk", tags=["Live Risk Evaluation"])

@router.post("/analyze-work/{id}", response_model=RiskResultDetail)
def analyze_real_work(id: int, work_type: str = Query("RECOMMENDED", regex="^(RECOMMENDED|COMPLETED)$")):
    """Calculates live risk for an existing real database work using PostgreSQL peer baselines."""
    with get_db_cursor() as cur:
        if work_type == "RECOMMENDED":
            cur.execute("""
                SELECT source_row_id as id, work_title, category, state_name, constituency_name,
                       allocation_amount as amount, recommended_date as date_val, work_status
                FROM public.works_all WHERE source_row_id = %s;
            """, (id,))
        else:
            cur.execute("""
                SELECT work_id as id, work_description as work_title, category, state_name, constituency_name,
                       final_amount as amount, completed_date as date_val, 'COMPLETED' as work_status
                FROM public.works_completed WHERE work_id = %s;
            """, (id,))

        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Work not found in database.")

        # Compute live peer stats
        cat = row["category"] or "UNKNOWN"
        cur.execute("SELECT allocation_amount FROM public.works_all WHERE category = %s;", (cat,))
        amounts = [float(r["allocation_amount"]) for r in cur.fetchall() if r["allocation_amount"]]
        import pandas as pd
        peer_stats = compute_group_stats(pd.Series(amounts))
        peer_stats["peer_level"] = "CATEGORY"

    amt = float(row["amount"]) if row["amount"] else 0.0
    fin_eval = analyze_financial_anomaly(amt, peer_stats)
    text_eval = evaluate_description_context(row["work_title"] or "", row["constituency_name"] or "", None, [], 1, 0)
    geo_eval = evaluate_geo_intelligence("", row["constituency_name"] or "", row["state_name"] or "", 0.2, 0.1)
    temp_eval = evaluate_temporal_and_status(
        row["date_val"] if work_type == "RECOMMENDED" else None,
        row["date_val"] if work_type == "COMPLETED" else None,
        row["work_status"],
        amt
    )

    fused = fuse_risk_scores(fin_eval, text_eval, geo_eval, temp_eval)

    import datetime
    return RiskResultDetail(
        anomaly_id=0,
        run_id="LIVE_EVALUATION",
        work_type=work_type,
        source_row_id=id if work_type == "RECOMMENDED" else None,
        work_id=id if work_type == "COMPLETED" else None,
        risk_score=fused["risk_score"],
        risk_level=fused["risk_level"],
        risk_category=fused["risk_category"],
        reason_codes=fused["reason_codes"],
        evidence_json=fused["evidence_json"],
        feature_values_json=fused["feature_values_json"],
        peer_stats_json=fused["peer_stats_json"],
        detector_version="v1.0.0_live",
        calculated_at=datetime.datetime.now(),
        work_title=row["work_title"],
        state_name=row["state_name"],
        constituency_name=row["constituency_name"],
        amount=amt
    )

@router.post("/sandbox", response_model=SandboxEvaluateResponse)
def evaluate_hypothetical_sandbox(payload: SandboxEvaluateRequest):
    """
    Stateless evaluation for hypothetical user input parameters.
    IMPORTANT: Input payload is NEVER saved to production database tables!
    """
    # Quick live peer lookup
    with get_db_cursor() as cur:
        cur.execute("SELECT allocation_amount FROM public.works_all WHERE UPPER(category) = UPPER(%s);", (payload.category,))
        amounts = [float(r["allocation_amount"]) for r in cur.fetchall() if r["allocation_amount"]]
        if not amounts:
            cur.execute("SELECT allocation_amount FROM public.works_all LIMIT 1000;")
            amounts = [float(r["allocation_amount"]) for r in cur.fetchall() if r["allocation_amount"]]

    import pandas as pd
    peer_stats = compute_group_stats(pd.Series(amounts))
    peer_stats["peer_level"] = "CATEGORY_LIVE"

    fin_eval = analyze_financial_anomaly(payload.allocation_amount, peer_stats)
    text_eval = evaluate_description_context(payload.work_title, payload.constituency_name, payload.recommended_date, [], 1, 0)
    geo_eval = evaluate_geo_intelligence("", payload.constituency_name, payload.state_name, 0.2, 0.1)
    temp_eval = evaluate_temporal_and_status(payload.recommended_date, None, payload.work_status, payload.allocation_amount)

    fused = fuse_risk_scores(fin_eval, text_eval, geo_eval, temp_eval)

    return SandboxEvaluateResponse(
        is_hypothetical=True,
        persisted_to_db=False,
        risk_score=fused["risk_score"],
        risk_level=fused["risk_level"],
        risk_category=fused["risk_category"],
        reason_codes=fused["reason_codes"],
        evidence_json=fused["evidence_json"],
        feature_values_json=fused["feature_values_json"],
        peer_stats_json=fused["peer_stats_json"]
    )
