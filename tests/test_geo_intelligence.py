"""
NIDHIDRISHTI — Unit Tests for Geo Intelligence & Locality Concentration
"""

import pytest
import pandas as pd
from ml.geo_intelligence import compute_locality_hhi, evaluate_geo_intelligence

def test_compute_locality_hhi():
    locs = pd.Series(["Ward 1", "Ward 1", "Ward 1", "Ward 1"])
    hhi = compute_locality_hhi(locs)
    assert hhi == 1.0 # 100% concentrated

def test_evaluate_geo_intelligence_high_concentration():
    res = evaluate_geo_intelligence("Ward 1", "Central", "Delhi", 0.8, 0.75)
    assert res["anomaly_detected"] == True
    assert res["reason_code"] == "HIGH_LOCALITY_CONCENTRATION"
