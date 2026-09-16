"""
NIDHIDRISHTI — Unit Tests for Peer Benchmarking
"""

import pytest
import pandas as pd
from ml.peer_benchmarking import compute_group_stats, PeerBenchmarker

def test_compute_group_stats_basic():
    amounts = pd.Series([100.0, 200.0, 300.0, 400.0, 500.0])
    stats = compute_group_stats(amounts)
    assert stats["sample_size"] == 5
    assert stats["median"] == 300.0
    assert stats["iqr"] == 200.0
    assert stats["mad"] == 100.0

def test_peer_benchmarker_fallback():
    df = pd.DataFrame([
        {"category": "Roads", "state_name": "Delhi", "constituency_name": "North", "amount": 100000.0},
        {"category": "Roads", "state_name": "Delhi", "constituency_name": "North", "amount": 120000.0},
        {"category": "Roads", "state_name": "Delhi", "constituency_name": "North", "amount": 110000.0},
        {"category": "Roads", "state_name": "Delhi", "constituency_name": "North", "amount": 105000.0},
        {"category": "Roads", "state_name": "Delhi", "constituency_name": "North", "amount": 115000.0},
    ])
    benchmarker = PeerBenchmarker()
    benchmarker.fit(df, category_col="category", state_col="state_name", constituency_col="constituency_name", amount_col="amount")
    
    # 5 samples -> constituency tier matched
    res = benchmarker.get_peer_stats("Roads", "Delhi", "North")
    assert res["peer_level"] == "CONSTITUENCY_CATEGORY"
    assert res["median"] == 110000.0

    # Unseen constituency -> fall back to state/category or category
    res_fallback = benchmarker.get_peer_stats("Roads", "Delhi", "South")
    assert res_fallback["peer_level"] in ["STATE_CATEGORY", "CATEGORY", "GLOBAL"]
