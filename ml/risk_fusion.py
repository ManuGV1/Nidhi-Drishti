"""
NIDHIDRISHTI — Explainable Risk Fusion Engine
Aggregates component scores into a 0-100 score, assigns risk levels, and generates explainable evidence.
"""

from typing import Dict, Any, List
from ml.config import FEATURE_WEIGHTS, categorize_risk_level

def fuse_risk_scores(
    financial_eval: Dict[str, Any],
    text_eval: Dict[str, Any],
    geo_eval: Dict[str, Any],
    temporal_eval: Dict[str, Any],
    compliance_eval: Dict[str, Any] = None,
    predictive_eval: Dict[str, Any] = None,
    agency_eval: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Fuses component anomaly features into a composite 0-100 risk score.
    Generates structured explainable evidence and recommended verification action.
    """
    f_ratio_score = financial_eval.get("financial_ratio_score", 0.0)
    z_score = financial_eval.get("robust_zscore_score", 0.0)
    text_score = text_eval.get("text_anomaly_score", 0.0)
    geo_score = geo_eval.get("geo_concentration_score", 0.0)
    temporal_score = temporal_eval.get("combined_temporal_status_score", 0.0)

    # Weighted combination
    w = FEATURE_WEIGHTS
    raw_composite = (
        f_ratio_score * w["financial_ratio"] +
        z_score * w["robust_zscore"] +
        text_score * w["text_similarity_anomaly"] +
        geo_score * w["geo_concentration"] +
        temporal_score * (w["temporal_burst"] + w["status_financial_combo"])
    )

    # Non-linear amplifier if MULTIPLE independent signals are present
    active_signals = sum([
        financial_eval.get("anomaly_detected", False),
        text_eval.get("anomaly_detected", False),
        geo_eval.get("anomaly_detected", False),
        temporal_eval.get("anomaly_detected", False)
    ])

    if active_signals >= 3:
        multi_signal_factor = 1.35
    elif active_signals == 2:
        multi_signal_factor = 1.15
    else:
        multi_signal_factor = 1.0

    final_score = float(min(100.0, raw_composite * multi_signal_factor))
    risk_level = categorize_risk_level(final_score)

    # Reason Codes Collection
    reason_codes = []
    
    # Financial reason codes
    fin_reasons = financial_eval.get("reason_codes", [])
    if fin_reasons:
        for rc in fin_reasons:
            if rc not in reason_codes and rc != "NORMAL_AMOUNT":
                reason_codes.append(rc)
    elif financial_eval.get("anomaly_detected"):
        rc = financial_eval.get("reason_code", "COST_OUTLIER")
        if rc not in reason_codes:
            reason_codes.append(rc)

    # Text reason codes
    if text_eval.get("anomaly_detected"):
        rc = text_eval.get("reason_code", "SIMILAR_DESCRIPTION")
        if rc not in reason_codes:
            reason_codes.append(rc)

    # Geo reason codes
    if geo_eval.get("anomaly_detected"):
        rc = geo_eval.get("reason_code", "CONCENTRATION_PATTERN")
        if rc not in reason_codes:
            reason_codes.append(rc)

    # Temporal / Status reason codes
    for r_code in temporal_eval.get("reason_codes", []):
        if r_code not in reason_codes:
            reason_codes.append(r_code)

    if not reason_codes:
        reason_codes.append("NORMAL_WORK_BASELINE")

    # Structured Human-Readable Narrative & Recommended Action
    evidence_bullet_points = []
    
    # Financial context
    amount = financial_eval.get("amount", 0.0)
    rec_amt = financial_eval.get("recommended_amount")
    sanc_amt = financial_eval.get("sanction_amount")
    act_amt = financial_eval.get("actual_amount")
    peer_med = financial_eval.get("peer_median", 0.0)
    ratio = financial_eval.get("ratio_to_median", 1.0)
    peer_lvl = financial_eval.get("peer_level", "GLOBAL")
    
    if ratio > 1.5:
        evidence_bullet_points.append(
            f"Cost Allocation (₹{amount:,.2f}) is {ratio}x the peer median (₹{peer_med:,.2f}) for peer level '{peer_lvl}'."
        )
    else:
        evidence_bullet_points.append(
            f"Cost Allocation (₹{amount:,.2f}) is aligned with peer median (₹{peer_med:,.2f})."
        )

    if "SANCTION_DEVIATION" in reason_codes and rec_amt and sanc_amt:
        evidence_bullet_points.append(
            f"Sanctioned amount (₹{sanc_amt:,.2f}) deviates significantly from recommended amount (₹{rec_amt:,.2f})."
        )

    if "ACTUAL_COST_DEVIATION" in reason_codes and act_amt:
        ref_val = sanc_amt or rec_amt or 0.0
        evidence_bullet_points.append(
            f"Actual completed cost (₹{act_amt:,.2f}) deviates significantly from sanctioned/recommended baseline (₹{ref_val:,.2f})."
        )

    # Text context
    if text_eval.get("is_batch_recommendation"):
        evidence_bullet_points.append(
            f"Identified as legitimate batch recommendation ({text_eval.get('same_constituency_count')} similar works in same constituency)."
        )
    elif text_eval.get("diff_constituency_count", 0) > 0:
        evidence_bullet_points.append(
            f"Description matches {text_eval.get('diff_constituency_count')} works across different constituencies/subdistricts."
        )

    # Geo context
    if geo_eval.get("anomaly_detected"):
        evidence_bullet_points.append(
            f"High locality concentration: {geo_eval.get('locality_share', 0)*100:.1f}% of constituency works clustered in '{geo_eval.get('locality_name')}'."
        )

    # Temporal / Status context
    for r_code in temporal_eval.get("reason_codes", []):
        if r_code == "STATUS_FINANCIAL_MISMATCH":
            evidence_bullet_points.append("Work status or financial amount shows status-financial mismatch.")
        elif r_code == "CONCENTRATION_PATTERN":
            evidence_bullet_points.append(f"Recommended during a high single-day recommendation burst ({temporal_eval.get('daily_burst_count')} works).")
        elif r_code == "TIMELINE_ANOMALY":
            evidence_bullet_points.append(f"Timeline duration anomaly detected (duration: {temporal_eval.get('duration_days')} days).")

    # Operational Action Guidance (Neutral Diagnostic Language)
    if risk_level == "CRITICAL":
        recommended_action = "Prioritize for urgent manual verification and administrative review."
    elif risk_level == "HIGH":
        recommended_action = "Prioritize for secondary verification and physical execution check."
    elif risk_level == "MEDIUM":
        recommended_action = "Include in routine operational sample audit."
    else:
        recommended_action = "Standard monitoring; no immediate investigation required."

    feature_values_json = {
        "amount": amount,
        "recommended_amount": rec_amt,
        "sanction_amount": sanc_amt,
        "actual_amount": act_amt,
        "peer_median": peer_med,
        "ratio_to_median": ratio,
        "robust_zscore": financial_eval.get("robust_zscore", 0.0),
        "duplicate_count": text_eval.get("duplicate_count", 0),
        "locality_share": geo_eval.get("locality_share", 0.0),
        "duration_days": temporal_eval.get("duration_days"),
        "early_warning_score": predictive_eval.get("early_warning_score", 0.0) if predictive_eval else 0.0,
        "compliance_score": compliance_eval.get("compliance_score", 0.0) if compliance_eval else 0.0
    }

    peer_stats_json = {
        "peer_level": peer_lvl,
        "peer_sample_size": financial_eval.get("peer_sample_size", 0),
        "peer_median": peer_med
    }

    evidence_json = {
        "bullet_points": evidence_bullet_points,
        "recommended_action": recommended_action,
        "active_signals_count": active_signals,
        "multi_signal_factor": multi_signal_factor,
        "compliance": compliance_eval if compliance_eval else {},
        "predictive": predictive_eval if predictive_eval else {},
        "agency": agency_eval if agency_eval else {}
    }

    return {
        "risk_score": round(final_score, 2),
        "risk_level": risk_level,
        "risk_category": reason_codes[0],
        "reason_codes": reason_codes,
        "evidence_json": evidence_json,
        "feature_values_json": feature_values_json,
        "peer_stats_json": peer_stats_json
    }
