"""
NIDHIDRISHTI — Implementing Agency Intelligence Module
Evaluates implementing agency (IDA) workload, share, cost behavior, and peer comparison.
Note: Strictly uses real IDA agency data; never invents individual vendor/contractor entities.
"""

from typing import Dict, Any

def evaluate_agency_intelligence(
    ida_name: str,
    agency_work_count: int = 1,
    agency_total_amount: float = 0.0,
    agency_avg_cost: float = 0.0,
    global_median_cost: float = 0.0
) -> Dict[str, Any]:
    """
    Computes workload concentration and cost behavior for implementing agencies.
    """
    clean_agency = (ida_name or "UNSPECIFIED").strip()
    
    # Cost behavior vs global median
    if global_median_cost > 0 and agency_avg_cost > 0:
        cost_ratio = agency_avg_cost / global_median_cost
    else:
        cost_ratio = 1.0

    # Workload intensity classification
    if agency_work_count >= 500:
        workload_category = "VERY_HIGH"
    elif agency_work_count >= 100:
        workload_category = "HIGH"
    elif agency_work_count >= 20:
        workload_category = "MODERATE"
    else:
        workload_category = "LOW"

    return {
        "ida_name": clean_agency,
        "agency_work_count": agency_work_count,
        "agency_total_amount": round(agency_total_amount, 2),
        "agency_avg_cost": round(agency_avg_cost, 2),
        "agency_cost_ratio": round(cost_ratio, 2),
        "workload_category": workload_category,
        "has_agency_data": clean_agency != "UNSPECIFIED"
    }
