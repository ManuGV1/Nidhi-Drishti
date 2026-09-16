"""
NIDHIDRISHTI — Predictive & Early Warning Engine
Calculates forward-looking risk indicators, delay probabilities, and emerging financial risks
based on historical peer distributions and active anomaly signals.
"""

from typing import Dict, Any, List

def evaluate_predictive_early_warning(
    financial_eval: Dict[str, Any],
    temporal_eval: Dict[str, Any],
    text_eval: Dict[str, Any],
    geo_eval: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Computes statistical early-warning indicators and delay/cost escalation predictions.
    """
    ratio = financial_eval.get("ratio_to_median", 1.0)
    robust_z = financial_eval.get("robust_zscore", 0.0)
    dur_days = temporal_eval.get("duration_days")
    burst_count = temporal_eval.get("daily_burst_count", 1)
    status_str = (temporal_eval.get("work_status") or "").upper()

    # 1. Delay Risk Score (0 - 100)
    # Higher for uncompleted works with aging dates or burst recommendations
    if dur_days is not None:
        if dur_days > 1095:
            delay_risk_score = 90.0
        elif dur_days > 730:
            delay_risk_score = 70.0
        elif dur_days > 365:
            delay_risk_score = 45.0
        else:
            delay_risk_score = min(40.0, (dur_days / 365.0) * 40.0)
    elif "RECOMMEND" in status_str or "SANCTION" in status_str:
        delay_risk_score = min(80.0, 20.0 + (burst_count / 30.0) * 30.0)
    else:
        delay_risk_score = 15.0

    # 2. Emerging Financial Risk Score (0 - 100)
    if ratio > 3.0 or robust_z > 4.0:
        emerging_fin_risk = min(100.0, (ratio / 3.0) * 75.0)
    elif ratio > 1.5:
        emerging_fin_risk = (ratio - 1.5) / 1.5 * 50.0
    else:
        emerging_fin_risk = 5.0

    # 3. Risk Escalation Probability Score (0 - 100)
    active_anomalies = sum([
        financial_eval.get("anomaly_detected", False),
        temporal_eval.get("anomaly_detected", False),
        text_eval.get("anomaly_detected", False),
        geo_eval.get("anomaly_detected", False)
    ])
    risk_escalation_score = min(100.0, active_anomalies * 25.0 + (delay_risk_score * 0.3) + (emerging_fin_risk * 0.3))

    # 4. Composite Early Warning Score (0 - 100)
    early_warning_score = (delay_risk_score * 0.35) + (emerging_fin_risk * 0.35) + (risk_escalation_score * 0.30)
    early_warning_score = round(min(100.0, max(0.0, early_warning_score)), 2)

    # Prediction & Confidence
    contributing_features = []
    if ratio > 1.5:
        contributing_features.append(f"Cost ratio {ratio}x peer median")
    if dur_days and dur_days > 365:
        contributing_features.append(f"Duration {dur_days} days")
    if burst_count >= 30:
        contributing_features.append(f"Batch recommendation burst ({burst_count} works)")

    if early_warning_score >= 70.0:
        prediction = "HIGH_RISK_OF_DELAY_AND_OVERRUN"
        confidence = 0.85
        explanation = "High early-warning indicator triggered by cost outlier ratio and timeline duration aging."
    elif early_warning_score >= 40.0:
        prediction = "MODERATE_MONITORING_RECOMMENDED"
        confidence = 0.75
        explanation = "Moderate early-warning indicator showing elevated cost or recommendation concentration."
    else:
        prediction = "LOW_RISK_BASELINE"
        confidence = 0.90
        explanation = "Baseline performance aligned with historical peer distributions."

    return {
        "delay_risk_score": round(delay_risk_score, 2),
        "emerging_financial_risk_score": round(emerging_fin_risk, 2),
        "risk_escalation_score": round(risk_escalation_score, 2),
        "early_warning_score": early_warning_score,
        "prediction": prediction,
        "confidence_level": confidence,
        "contributing_features": contributing_features,
        "explanation": explanation
    }
