"""
NIDHIDRISHTI — Financial Anomaly Detection Module
Computes robust z-scores and cost-to-median ratio metrics with high-cost safeguards.
"""

from typing import Dict, Any
import numpy as np

def analyze_financial_anomaly(
    amount: float,
    peer_stats: Dict[str, Any],
    recommended_amount: float = None,
    sanction_amount: float = None,
    actual_amount: float = None
) -> Dict[str, Any]:
    """
    Evaluates monetary amount against peer group statistics and analyzes
    recommended vs. sanctioned vs. actual financial deviations.
    """
    # Primary amount to test against peer statistics
    primary_amt = amount if (amount is not None and amount > 0) else (
        sanction_amount if (sanction_amount is not None and sanction_amount > 0) else (
            recommended_amount if (recommended_amount is not None and recommended_amount > 0) else (
                actual_amount if (actual_amount is not None and actual_amount > 0) else 0.0
            )
        )
    )

    median = peer_stats.get("median", 0.0)
    mad = peer_stats.get("mad", 0.0)

    # 1. Ratio to Peer Median
    if median > 0 and primary_amt > 0:
        ratio = float(primary_amt / median)
    else:
        ratio = 1.0

    # 2. Robust Z-Score
    if mad > 0 and primary_amt > 0:
        robust_z = float((primary_amt - median) / (1.4826 * mad))
    else:
        robust_z = 0.0

    # 3. Financial Ratio Feature Score (0 to 100)
    if ratio <= 1.5:
        financial_ratio_score = 0.0
    elif ratio <= 3.0:
        financial_ratio_score = (ratio - 1.5) / 1.5 * 50.0
    else:
        financial_ratio_score = min(100.0, 50.0 + (ratio - 3.0) / 2.0 * 50.0)

    # 4. Robust Z-Score Feature Score (0 to 100)
    if robust_z <= 2.0:
        zscore_score = 0.0
    elif robust_z <= 5.0:
        zscore_score = (robust_z - 2.0) / 3.0 * 80.0
    else:
        zscore_score = min(100.0, 80.0 + (robust_z - 5.0) / 2.0 * 20.0)

    # 5. Financial Deviations (Sanction vs Recommended & Actual vs Sanction/Recommended)
    reason_codes = []
    sanction_dev_score = 0.0
    actual_dev_score = 0.0

    # Sanction vs Recommended deviation
    if recommended_amount and sanction_amount and recommended_amount > 0:
        sanc_ratio = sanction_amount / recommended_amount
        diff = abs(sanction_amount - recommended_amount)
        if diff >= 50000 and (sanc_ratio > 1.3 or sanc_ratio < 0.7):
            reason_codes.append("SANCTION_DEVIATION")
            sanction_dev_score = min(90.0, abs(sanc_ratio - 1.0) * 80.0)

    # Actual vs Sanction / Recommended deviation
    if actual_amount and actual_amount > 0:
        ref_amt = sanction_amount if (sanction_amount and sanction_amount > 0) else recommended_amount
        if ref_amt and ref_amt > 0:
            act_ratio = actual_amount / ref_amt
            diff = abs(actual_amount - ref_amt)
            if diff >= 50000 and (act_ratio > 1.25 or act_ratio < 0.75):
                reason_codes.append("ACTUAL_COST_DEVIATION")
                actual_dev_score = min(90.0, abs(act_ratio - 1.0) * 80.0)

    # Cost Outlier vs Peer Group
    cost_outlier_detected = ratio >= 2.5 or robust_z >= 3.5
    if cost_outlier_detected:
        reason_codes.append("COST_OUTLIER")

    if not reason_codes:
        reason_codes.append("NORMAL_AMOUNT")

    anomaly_detected = cost_outlier_detected or len(reason_codes) > 1 or ("SANCTION_DEVIATION" in reason_codes) or ("ACTUAL_COST_DEVIATION" in reason_codes)

    # Combined financial score
    financial_score = max(financial_ratio_score, zscore_score, sanction_dev_score, actual_dev_score)

    return {
        "amount": primary_amt,
        "recommended_amount": recommended_amount,
        "sanction_amount": sanction_amount,
        "actual_amount": actual_amount,
        "peer_median": median,
        "peer_sample_size": peer_stats.get("sample_size", 0),
        "peer_level": peer_stats.get("peer_level", "GLOBAL"),
        "ratio_to_median": round(ratio, 2),
        "robust_zscore": round(robust_z, 2),
        "financial_ratio_score": round(financial_ratio_score, 2),
        "robust_zscore_score": round(zscore_score, 2),
        "financial_score": round(financial_score, 2),
        "anomaly_detected": anomaly_detected,
        "reason_code": reason_codes[0],
        "reason_codes": reason_codes
    }

