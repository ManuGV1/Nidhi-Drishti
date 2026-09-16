"""
NIDHIDRISHTI — Geographic Intelligence Module
Analyzes locality concentration (Herfindahl-Hirschman Index) and spatial spread using cleaned text data.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np

def compute_locality_hhi(locations: pd.Series) -> float:
    """
    Computes Herfindahl-Hirschman Index (HHI) for location distribution.
    HHI ranges from 1/N (uniform distribution) to 1.0 (100% concentrated in single locality).
    """
    clean_locs = locations.dropna().astype(str)
    if len(clean_locs) == 0:
        return 0.0

    counts = clean_locs.value_counts()
    shares = counts / len(clean_locs)
    hhi = float(np.sum(shares ** 2))
    return round(hhi, 4)

def evaluate_geo_intelligence(
    locality_name: str,
    constituency_name: str,
    state_name: str,
    constituency_hhi: float,
    locality_share: float
) -> Dict[str, Any]:
    """
    Evaluates geographic concentration indicators.
    High locality share within a constituency is evaluated as a spatial signal.
    """
    if locality_share <= 0.35:
        geo_score = 0.0
        reason_code = "NORMAL_LOCALITY_DISTRIBUTION"
        anomaly_detected = False
    elif locality_share <= 0.60:
        geo_score = (locality_share - 0.35) / 0.25 * 50.0
        reason_code = "MODERATE_LOCALITY_CONCENTRATION"
        anomaly_detected = False
    else:
        geo_score = min(100.0, 50.0 + (locality_share - 0.60) / 0.40 * 50.0)
        reason_code = "HIGH_LOCALITY_CONCENTRATION"
        anomaly_detected = True

    return {
        "locality_name": locality_name if locality_name else "UNSPECIFIED",
        "constituency_name": constituency_name,
        "state_name": state_name,
        "constituency_hhi": constituency_hhi,
        "locality_share": round(locality_share, 4),
        "geo_concentration_score": round(geo_score, 2),
        "anomaly_detected": anomaly_detected,
        "reason_code": reason_code
    }
