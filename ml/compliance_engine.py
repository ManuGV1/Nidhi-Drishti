"""
NIDHIDRISHTI — Explainable Compliance & Rule Engine
Evaluates compliance rules based strictly on supported database fields.
Every rule provides rule ID, severity, triggered value, expected/baseline value, explanation, and source fields.
"""

from typing import Dict, Any, List

def evaluate_compliance_rules(
    financial_eval: Dict[str, Any],
    temporal_eval: Dict[str, Any],
    text_eval: Dict[str, Any],
    geo_eval: Dict[str, Any],
    agency_eval: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Evaluates rule-based compliance checks and generates structured compliance results.
    """
    rules_triggered = []
    rules_evaluated = []

    # Rule 1: COMPL-001 — Financial Amount & Cost Deviation
    reasons = financial_eval.get("reason_codes", [])
    if "SANCTION_DEVIATION" in reasons or "ACTUAL_COST_DEVIATION" in reasons:
        rec_val = financial_eval.get("recommended_amount") or 0.0
        sanc_val = financial_eval.get("sanction_amount") or 0.0
        act_val = financial_eval.get("actual_amount") or 0.0
        rule_item = {
            "rule_id": "COMPL-001",
            "rule_name": "Financial Cost Allocation Deviation",
            "severity": "HIGH",
            "triggered": True,
            "triggered_value": f"Sanction: ₹{sanc_val:,.2f}, Actual: ₹{act_val:,.2f}",
            "expected_baseline": f"Recommended: ₹{rec_val:,.2f}",
            "explanation": "Sanctioned or actual completed cost deviates significantly from original recommended allocation.",
            "source_fields": ["recommended_amount", "sanction_amount", "actual_amount"]
        }
        rules_triggered.append(rule_item)
    rules_evaluated.append("COMPL-001")

    # Rule 2: COMPL-002 — Lifecycle Duration & Stage Ageing
    dur_days = temporal_eval.get("duration_days")
    temp_reasons = temporal_eval.get("reason_codes", [])
    if "TIMELINE_ANOMALY" in temp_reasons or (dur_days and dur_days > 730):
        rule_item = {
            "rule_id": "COMPL-002",
            "rule_name": "Lifecycle Timeline & Stage Ageing Anomaly",
            "severity": "HIGH",
            "triggered": True,
            "triggered_value": f"Duration: {dur_days} days",
            "expected_baseline": "Standard lifecycle completion <= 730 days (2 years)",
            "explanation": "Work lifecycle duration exceeds expected thresholds or exhibits negative date sequence.",
            "source_fields": ["recommended_date", "sanction_date", "completed_date", "actual_end_date"]
        }
        rules_triggered.append(rule_item)
    rules_evaluated.append("COMPL-002")

    # Rule 3: COMPL-003 — Status & Financial Mismatch
    if "STATUS_FINANCIAL_MISMATCH" in temp_reasons:
        status_str = temporal_eval.get("work_status", "")
        rule_item = {
            "rule_id": "COMPL-003",
            "rule_name": "Status & Financial Alignment Mismatch",
            "severity": "CRITICAL",
            "triggered": True,
            "triggered_value": f"Status: '{status_str}' with non-zero financial allocation/expenditure",
            "expected_baseline": "Cancelled/Rejected work must have zero financial allocation; Completed work must have positive cost",
            "explanation": "Discrepancy detected between recorded work administrative status and financial disbursement.",
            "source_fields": ["work_status", "work_stage", "allocation_amount", "actual_amount"]
        }
        rules_triggered.append(rule_item)
    rules_evaluated.append("COMPL-003")

    # Rule 4: COMPL-004 — High Locality / Agency Concentration Burst
    burst_cnt = temporal_eval.get("daily_burst_count", 1)
    if "CONCENTRATION_PATTERN" in temp_reasons or burst_cnt >= 30:
        rule_item = {
            "rule_id": "COMPL-004",
            "rule_name": "Recommendation Concentration Burst Pattern",
            "severity": "MEDIUM",
            "triggered": True,
            "triggered_value": f"Daily recommendations burst: {burst_cnt} works in single day",
            "expected_baseline": "Normal recommendation frequency <= 29 works per day per constituency",
            "explanation": "High volume of recommendations submitted on a single date, indicating potential batch approval pattern.",
            "source_fields": ["recommended_date", "constituency_name"]
        }
        rules_triggered.append(rule_item)
    rules_evaluated.append("COMPL-004")

    # Rule 5: COMPL-005 — Description Similarity & Cluster Signal
    if text_eval.get("anomaly_detected") and not text_eval.get("is_batch_recommendation"):
        diff_cnt = text_eval.get("diff_constituency_count", 0)
        rule_item = {
            "rule_id": "COMPL-005",
            "rule_name": "Cross-Region Work Description Similarity Signal",
            "severity": "MEDIUM",
            "triggered": True,
            "triggered_value": f"Matches {diff_cnt} works across different constituencies/subdistricts",
            "expected_baseline": "Unique work descriptions tailored to localized scope",
            "explanation": "Near-identical work descriptions flagged across geographically separate areas for manual review.",
            "source_fields": ["work_title", "work_description", "constituency_name", "state_name"]
        }
        rules_triggered.append(rule_item)
    rules_evaluated.append("COMPL-005")

    # Rule 6: COMPL-006 — Missing Critical Lifecycle Field
    rec_date = temporal_eval.get("recommended_date")
    sanc_date = temporal_eval.get("sanction_date")
    comp_date = temporal_eval.get("completed_date")
    status_val = (temporal_eval.get("work_status") or "").upper()
    
    if "COMPLET" in status_val and not comp_date:
        rule_item = {
            "rule_id": "COMPL-006",
            "rule_name": "Missing Completion Timestamp in Lifecycle Data",
            "severity": "LOW",
            "triggered": True,
            "triggered_value": "Completed status recorded without completion date",
            "expected_baseline": "All completed works must possess explicit completion date",
            "explanation": "Data quality warning: completed record lacks formal end date record.",
            "source_fields": ["completed_date", "actual_end_date", "work_status"]
        }
        rules_triggered.append(rule_item)
    rules_evaluated.append("COMPL-006")

    compliance_score = float(len(rules_triggered) * 20.0)
    compliance_score = min(100.0, compliance_score)

    return {
        "compliance_score": round(compliance_score, 2),
        "total_rules_evaluated": len(rules_evaluated),
        "triggered_rules_count": len(rules_triggered),
        "rules_triggered": rules_triggered,
        "is_compliant": len(rules_triggered) == 0
    }
