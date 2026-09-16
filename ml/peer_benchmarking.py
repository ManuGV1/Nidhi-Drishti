"""
NIDHIDRISHTI — Peer Benchmarking Module
Computes robust statistical baselines (median, IQR, MAD, percentiles) across hierarchical peer groups.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional
from ml.config import MIN_PEER_SAMPLE_SIZE

def compute_group_stats(amounts: pd.Series) -> Dict[str, float]:
    """Calculate robust statistical metrics for a series of monetary amounts."""
    valid = amounts.dropna().astype(float)
    n = len(valid)
    if n == 0:
        return {
            "sample_size": 0,
            "median": 0.0,
            "iqr": 0.0,
            "mad": 0.0,
            "p90": 0.0,
            "p95": 0.0,
            "mean": 0.0,
            "std": 0.0
        }
    
    med = float(np.median(valid))
    q75, q25 = np.percentile(valid, [75, 25])
    iqr = float(q75 - q25)
    mad = float(np.median(np.abs(valid - med)))
    p90 = float(np.percentile(valid, 90))
    p95 = float(np.percentile(valid, 95))
    mean_val = float(np.mean(valid))
    std_val = float(np.std(valid))
    
    return {
        "sample_size": n,
        "median": med,
        "iqr": iqr,
        "mad": mad,
        "p90": p90,
        "p95": p95,
        "mean": mean_val,
        "std": std_val
    }

class PeerBenchmarker:
    """Manages multi-tier peer statistics for recommended and completed works."""

    def __init__(self):
        self.constituency_peer_stats: Dict[Tuple[str, str], Dict[str, float]] = {}
        self.ida_peer_stats: Dict[Tuple[str, str], Dict[str, float]] = {}
        self.state_peer_stats: Dict[Tuple[str, str], Dict[str, float]] = {}
        self.house_peer_stats: Dict[Tuple[str, str], Dict[str, float]] = {}
        self.category_peer_stats: Dict[str, Dict[str, float]] = {}
        self.global_stats: Dict[str, float] = {}

    def fit(self, df: pd.DataFrame, category_col: str = "category", 
            state_col: str = "state_name", constituency_col: str = "constituency_name",
            ida_col: str = "ida_name", house_col: str = "house_of_parliament",
            amount_col: str = "amount"):
        """Build multi-tier peer statistics tables from database dataset."""
        # 1. Global Baseline
        self.global_stats = compute_group_stats(df[amount_col])

        # 2. Category Level Baseline
        for cat, group in df.groupby(category_col):
            cat_str = str(cat) if pd.notna(cat) else "UNKNOWN"
            self.category_peer_stats[cat_str] = compute_group_stats(group[amount_col])

        # 3. House + Category Baseline
        if house_col in df.columns:
            for (cat, house), group in df.groupby([category_col, house_col]):
                cat_str = str(cat) if pd.notna(cat) else "UNKNOWN"
                house_str = str(house) if pd.notna(house) else "UNKNOWN"
                self.house_peer_stats[(cat_str, house_str)] = compute_group_stats(group[amount_col])

        # 4. State + Category Baseline
        for (cat, st), group in df.groupby([category_col, state_col]):
            cat_str = str(cat) if pd.notna(cat) else "UNKNOWN"
            st_str = str(st) if pd.notna(st) else "UNKNOWN"
            self.state_peer_stats[(cat_str, st_str)] = compute_group_stats(group[amount_col])

        # 5. IDA + Category Baseline
        if ida_col in df.columns:
            for (cat, ida), group in df.groupby([category_col, ida_col]):
                cat_str = str(cat) if pd.notna(cat) else "UNKNOWN"
                ida_str = str(ida) if pd.notna(ida) else "UNKNOWN"
                self.ida_peer_stats[(cat_str, ida_str)] = compute_group_stats(group[amount_col])

        # 6. Constituency + Category Baseline
        for (cat, con), group in df.groupby([category_col, constituency_col]):
            cat_str = str(cat) if pd.notna(cat) else "UNKNOWN"
            con_str = str(con) if pd.notna(con) else "UNKNOWN"
            self.constituency_peer_stats[(cat_str, con_str)] = compute_group_stats(group[amount_col])

    def get_peer_stats(self, category: str, state_name: str, constituency_name: str, 
                       ida_name: str = None, house_of_parliament: str = None) -> Dict[str, Any]:
        """
        Retrieves the most specific peer statistics available with sample_size >= MIN_PEER_SAMPLE_SIZE.
        Fallback hierarchy: Constituency+Category -> IDA+Category -> State+Category -> House+Category -> Category -> Global.
        """
        cat_key = str(category) if category else "UNKNOWN"
        st_key = str(state_name) if state_name else "UNKNOWN"
        con_key = str(constituency_name) if constituency_name else "UNKNOWN"
        ida_key = str(ida_name) if ida_name else "UNKNOWN"
        house_key = str(house_of_parliament) if house_of_parliament else "UNKNOWN"

        # Try Constituency tier
        stats = self.constituency_peer_stats.get((cat_key, con_key))
        if stats and stats["sample_size"] >= MIN_PEER_SAMPLE_SIZE:
            res = stats.copy()
            res["peer_level"] = "CONSTITUENCY_CATEGORY"
            return res

        # Try IDA tier
        if ida_name:
            stats = self.ida_peer_stats.get((cat_key, ida_key))
            if stats and stats["sample_size"] >= MIN_PEER_SAMPLE_SIZE:
                res = stats.copy()
                res["peer_level"] = "IDA_CATEGORY"
                return res

        # Try State tier
        stats = self.state_peer_stats.get((cat_key, st_key))
        if stats and stats["sample_size"] >= MIN_PEER_SAMPLE_SIZE:
            res = stats.copy()
            res["peer_level"] = "STATE_CATEGORY"
            return res

        # Try House tier
        if house_of_parliament:
            stats = self.house_peer_stats.get((cat_key, house_key))
            if stats and stats["sample_size"] >= MIN_PEER_SAMPLE_SIZE:
                res = stats.copy()
                res["peer_level"] = "HOUSE_CATEGORY"
                return res

        # Try Category tier
        stats = self.category_peer_stats.get(cat_key)
        if stats and stats["sample_size"] >= MIN_PEER_SAMPLE_SIZE:
            res = stats.copy()
            res["peer_level"] = "CATEGORY"
            return res

        # Fallback to Global
        res = self.global_stats.copy()
        res["peer_level"] = "GLOBAL"
        return res
