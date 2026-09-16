"""
NIDHIDRISHTI — Temporal Analytics & Status Signal Module
Evaluates safe recommendation-to-completion duration, recommendation bursts, and status-amount combinations.
"""

from typing import Dict, Any, Optional
import datetime

def evaluate_temporal_and_status(
    recommended_date: Optional[datetime.date],
    completed_date: Optional[datetime.date],
    work_status: Optional[str],
    allocation_amount: float,
    daily_burst_count: int = 1,
    sanction_date: Optional[datetime.date] = None,
    sanction_amount: float = None,
    actual_amount: float = None
) -> Dict[str, Any]:
    """
    Evaluates temporal gaps (recommendation->sanction, sanction->completion), 
    recommendation bursts, and status-financial alignment.
    """
    rec_to_sanc_days = None
    sanc_to_comp_days = None
    rec_to_comp_days = None

    temporal_score = 0.0
    status_score = 0.0
    reason_codes = []

    # 1. Recommendation -> Sanction Duration
    if recommended_date and sanction_date:
        rec_to_sanc_days = (sanction_date - recommended_date).days
        if rec_to_sanc_days < 0:
            temporal_score = max(temporal_score, 95.0)
            reason_codes.append("TIMELINE_ANOMALY")
        elif rec_to_sanc_days > 730: # >2 years
            temporal_score = max(temporal_score, 60.0)
            reason_codes.append("TIMELINE_ANOMALY")

    # 2. Sanction -> Completion / Recommendation -> Completion Duration
    if sanction_date and completed_date:
        sanc_to_comp_days = (completed_date - sanction_date).days
        if sanc_to_comp_days < 0:
            temporal_score = max(temporal_score, 100.0)
            reason_codes.append("TIMELINE_ANOMALY")
        elif sanc_to_comp_days > 1095: # >3 years
            temporal_score = max(temporal_score, 65.0)
            reason_codes.append("TIMELINE_ANOMALY")

    if recommended_date and completed_date:
        rec_to_comp_days = (completed_date - recommended_date).days
        if rec_to_comp_days < 0:
            temporal_score = max(temporal_score, 100.0)
            if "TIMELINE_ANOMALY" not in reason_codes:
                reason_codes.append("TIMELINE_ANOMALY")

    # 3. Recommendation Burst / Concentration Analysis
    if daily_burst_count >= 30:
        temporal_score = max(temporal_score, min(85.0, (daily_burst_count - 30) * 1.5 + 45.0))
        reason_codes.append("CONCENTRATION_PATTERN")

    # 4. Status & Financial Alignment
    eff_amt = actual_amount if (actual_amount and actual_amount > 0) else (
        sanction_amount if (sanction_amount and sanction_amount > 0) else allocation_amount
    )
    status_str = (work_status or "").upper().strip()

    if any(term in status_str for term in ["CANCEL", "REJECT", "DROP", "ABANDON"]) and eff_amt > 0:
        status_score = 90.0
        reason_codes.append("STATUS_FINANCIAL_MISMATCH")
    elif "COMPLET" in status_str and (eff_amt is None or eff_amt <= 0):
        status_score = 60.0
        reason_codes.append("STATUS_FINANCIAL_MISMATCH")

    combined_score = max(temporal_score, status_score)
    primary_reason = reason_codes[0] if reason_codes else "NORMAL_TEMPORAL_STATUS"

    return {
        "recommended_date": str(recommended_date) if recommended_date else None,
        "sanction_date": str(sanction_date) if sanction_date else None,
        "completed_date": str(completed_date) if completed_date else None,
        "rec_to_sanc_days": rec_to_sanc_days,
        "sanc_to_comp_days": sanc_to_comp_days,
        "duration_days": rec_to_comp_days or sanc_to_comp_days or rec_to_sanc_days,
        "daily_burst_count": daily_burst_count,
        "work_status": work_status,
        "temporal_score": round(temporal_score, 2),
        "status_score": round(status_score, 2),
        "combined_temporal_status_score": round(combined_score, 2),
        "anomaly_detected": combined_score >= 45.0,
        "reason_codes": reason_codes,
        "primary_reason": primary_reason
    }

