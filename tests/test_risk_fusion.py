"""
NIDHIDRISHTI — Unit Tests for Risk Fusion Engine & Explainability
"""

import pytest
from ml.risk_fusion import fuse_risk_scores

def test_risk_fusion_normal_work():
    fin = {"financial_ratio_score": 0.0, "robust_zscore_score": 0.0, "anomaly_detected": False, "amount": 100000.0, "peer_median": 100000.0, "ratio_to_median": 1.0, "peer_level": "CATEGORY"}
    text = {"text_anomaly_score": 0.0, "anomaly_detected": False, "is_batch_recommendation": False}
    geo = {"geo_concentration_score": 0.0, "anomaly_detected": False}
    temp = {"combined_temporal_status_score": 0.0, "anomaly_detected": False, "reason_codes": []}

    fused = fuse_risk_scores(fin, text, geo, temp)
    assert fused["risk_score"] <= 24.99
    assert fused["risk_level"] == "LOW"
    assert "recommended_action" in fused["evidence_json"]

def test_risk_fusion_multi_signal_amplifier():
    fin = {"financial_ratio_score": 80.0, "robust_zscore_score": 70.0, "anomaly_detected": True, "amount": 500000.0, "peer_median": 100000.0, "ratio_to_median": 5.0, "reason_code": "HIGH_COST_VS_PEER"}
    text = {"text_anomaly_score": 75.0, "anomaly_detected": True, "reason_code": "CROSS_REGION_DUPLICATE_TITLE"}
    geo = {"geo_concentration_score": 60.0, "anomaly_detected": True, "reason_code": "HIGH_LOCALITY_CONCENTRATION", "locality_share": 0.7}
    temp = {"combined_temporal_status_score": 85.0, "anomaly_detected": True, "reason_codes": ["CANCELLED_WORK_WITH_ALLOCATION"]}

    fused = fuse_risk_scores(fin, text, geo, temp)
    assert fused["risk_score"] > 50.0
    assert fused["risk_level"] in ["HIGH", "CRITICAL"]
    assert fused["evidence_json"]["active_signals_count"] == 4
