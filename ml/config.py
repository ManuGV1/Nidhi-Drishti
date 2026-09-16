"""
NIDHIDRISHTI — Intelligence Engine Configuration
Defines detector weights, risk thresholds, peer grouping rules, and safeguards.
"""

DETECTOR_VERSION = "v1.0.0"
FEATURE_VERSION = "v1.0.0"
SOURCE_DATA_VERSION = "mplads_v1.0_cleaned"

# Risk Level Boundaries
RISK_LEVEL_LOW_MAX = 24.99
RISK_LEVEL_MEDIUM_MAX = 49.99
RISK_LEVEL_HIGH_MAX = 74.99

def categorize_risk_level(score: float) -> str:
    if score <= RISK_LEVEL_LOW_MAX:
        return "LOW"
    elif score <= RISK_LEVEL_MEDIUM_MAX:
        return "MEDIUM"
    elif score <= RISK_LEVEL_HIGH_MAX:
        return "HIGH"
    else:
        return "CRITICAL"

# Defensible Feature Weights for Risk Fusion (Summing to 1.0)
FEATURE_WEIGHTS = {
    "financial_ratio": 0.25,        # Cost vs peer group median
    "robust_zscore": 0.15,         # Statistical z-score outlier intensity
    "text_similarity_anomaly": 0.20,# Duplicate description across different subdistricts/MPs
    "geo_concentration": 0.15,     # High locality concentration ratio
    "temporal_burst": 0.10,        # Bulk recommendation day spikes
    "status_financial_combo": 0.15 # Unusual status-allocation combinations
}

# Minimum peer sample size threshold for confident peer statistics
MIN_PEER_SAMPLE_SIZE = 5

# High-cost alone safeguard cap: cost ratio alone caps risk contribution at 40 points
MAX_SINGLE_FEATURE_RISK_CONTRIBUTION = 40.0
