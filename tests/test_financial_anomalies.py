"""
NIDHIDRISHTI — Unit Tests for Financial Anomaly Detection
"""

import pytest
from ml.financial_anomalies import analyze_financial_anomaly

def test_normal_amount():
    peer_stats = {"median": 100000.0, "mad": 10000.0, "sample_size": 10, "peer_level": "CATEGORY"}
    res = analyze_financial_anomaly(110000.0, peer_stats)
    assert res["ratio_to_median"] == 1.1
    assert res["anomaly_detected"] == False
    assert res["reason_code"] == "NORMAL_AMOUNT"

def test_high_amount_outlier():
    peer_stats = {"median": 100000.0, "mad": 10000.0, "sample_size": 10, "peer_level": "CATEGORY"}
    res = analyze_financial_anomaly(500000.0, peer_stats)
    assert res["ratio_to_median"] == 5.0
    assert res["robust_zscore"] > 3.0
    assert res["anomaly_detected"] == True
    assert res["reason_code"] == "COST_OUTLIER"
