"""
NIDHIDRISHTI — Comprehensive Intelligence Pipeline Orchestrator
Processes both MPLADS snapshot data and Nirikshan real dataset.
Computes multi-tier peer statistics, financial deviations, temporal/status signals,
agency intelligence, compliance rules, predictive early warning, and fused explainable risk scores (0-100).
"""

import time
import uuid
import datetime
import pandas as pd
import numpy as np
import psycopg2
import psycopg2.extras
from typing import Dict, Any, Tuple

from ml.config import DETECTOR_VERSION, FEATURE_VERSION, SOURCE_DATA_VERSION
from ml.peer_benchmarking import PeerBenchmarker
from ml.financial_anomalies import analyze_financial_anomaly
from ml.text_similarity import TextSimilarityAnalyzer, evaluate_description_context
from ml.geo_intelligence import compute_locality_hhi, evaluate_geo_intelligence
from ml.temporal_analytics import evaluate_temporal_and_status
from ml.compliance_engine import evaluate_compliance_rules
from ml.predictive_early_warning import evaluate_predictive_early_warning
from ml.agency_intelligence import evaluate_agency_intelligence
from ml.risk_fusion import fuse_risk_scores

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "nidhidrishti"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432"))
}

def run_intelligence_pipeline(db_config: Dict[str, Any] = None, conn=None) -> Tuple[str, Dict[str, Any]]:
    """
    Executes end-to-end batch intelligence pipeline across MPLADS and Nirikshan datasets.
    Returns (run_id, summary_stats).
    """
    close_conn = False
    if conn is None:
        if db_config is not None:
            conn = psycopg2.connect(**db_config)
            close_conn = True
        else:
            try:
                from backend.db import get_db_connection
                conn = get_db_connection()
                close_conn = True
            except Exception:
                conn = psycopg2.connect(**DB_CONFIG)
                close_conn = True

    start_time = time.time()
    print("=" * 80)
    print("STARTING NIDHIDRISHTI COMPREHENSIVE INTELLIGENCE PIPELINE")
    print("=" * 80)
    
    # -------------------------------------------------------------------------
    # 1. LOAD MPLADS SNAPSHOT WORKS
    # -------------------------------------------------------------------------
    print("Loading MPLADS works_all from PostgreSQL...")
    df_mplads_rec = pd.read_sql_query("""
        SELECT source_row_id, work_title, category, state_name, constituency_name,
               ida_name, city, ward, block, village, recommended_date, allocation_amount, work_status, mp_name, house
        FROM public.works_all;
    """, conn)
    print(f"  MPLADS Recommended works: {len(df_mplads_rec):,}")

    print("Loading MPLADS works_completed from PostgreSQL...")
    df_mplads_comp = pd.read_sql_query("""
        SELECT work_id, source_row_id, work_description AS work_title, category, state_name, constituency_name,
               mp_name, final_amount AS allocation_amount, completed_date, ida_name, house
        FROM public.works_completed;
    """, conn)
    print(f"  MPLADS Completed works: {len(df_mplads_comp):,}")

    # -------------------------------------------------------------------------
    # 2. LOAD NIRIKSHAN DATASET WORKS
    # -------------------------------------------------------------------------
    print("Loading Nirikshan recommended works from PostgreSQL...")
    df_nirikshan_rec = pd.read_sql_query("""
        SELECT nirikshan_id, recommendation_detail_id, work_id, activity_name, work_description AS work_title,
               work_category AS category, state_name, constituency, house_of_parliament, tenure, mp_name, ida_name,
               recommendation_date, recommended_amount, sanction_date, sanction_amount, work_stage, flag
        FROM public.nirikshan_recommended;
    """, conn)
    print(f"  Nirikshan Recommended works: {len(df_nirikshan_rec):,}")

    print("Loading Nirikshan completed works (reconciled with recommended) from PostgreSQL...")
    df_nirikshan_comp = pd.read_sql_query("""
        SELECT DISTINCT ON (c.nirikshan_id)
               c.nirikshan_id, c.recommendation_detail_id, c.work_id, c.activity_name, c.work_description AS work_title,
               c.work_category AS category, c.state_name, c.constituency, c.house_of_parliament, c.mp_name, c.ida_name,
               c.actual_end_date, c.actual_amount,
               r.recommendation_date, r.recommended_amount, r.sanction_date, r.sanction_amount, r.work_stage
        FROM public.nirikshan_completed c
        LEFT JOIN public.nirikshan_recommended r ON c.recommendation_detail_id = r.recommendation_detail_id
        ORDER BY c.nirikshan_id, r.recommendation_date DESC NULLS LAST;
    """, conn)
    print(f"  Nirikshan Completed works: {len(df_nirikshan_comp):,}")

    # -------------------------------------------------------------------------
    # 3. BUILD UNIFIED PEER BENCHMARKING ENGINE
    # -------------------------------------------------------------------------
    print("Fitting Peer Benchmarker on combined baseline dataset...")
    mplads_peer_df = pd.DataFrame({
        "category": df_mplads_rec["category"],
        "state_name": df_mplads_rec["state_name"],
        "constituency_name": df_mplads_rec["constituency_name"],
        "ida_name": df_mplads_rec["ida_name"],
        "house_of_parliament": df_mplads_rec["house"],
        "amount": df_mplads_rec["allocation_amount"]
    })

    nirikshan_peer_df = pd.DataFrame({
        "category": df_nirikshan_rec["category"],
        "state_name": df_nirikshan_rec["state_name"],
        "constituency_name": df_nirikshan_rec["constituency"],
        "ida_name": df_nirikshan_rec["ida_name"],
        "house_of_parliament": df_nirikshan_rec["house_of_parliament"],
        "amount": df_nirikshan_rec["recommended_amount"].fillna(df_nirikshan_rec["sanction_amount"])
    })

    unified_peer_df = pd.concat([mplads_peer_df, nirikshan_peer_df], ignore_index=True)

    peer_benchmarker = PeerBenchmarker()
    peer_benchmarker.fit(
        unified_peer_df,
        category_col="category",
        state_col="state_name",
        constituency_col="constituency_name",
        ida_col="ida_name",
        house_col="house_of_parliament",
        amount_col="amount"
    )

    # -------------------------------------------------------------------------
    # 4. PRE-COMPUTE CONCENTRATION & TITLE FREQUENCIES
    # -------------------------------------------------------------------------
    print("Pre-calculating locality concentration, burst counts, and title frequencies...")
    
    all_titles_df = pd.concat([
        pd.DataFrame({"title": df_mplads_rec["work_title"], "constituency": df_mplads_rec["constituency_name"]}),
        pd.DataFrame({"title": df_mplads_comp["work_title"], "constituency": df_mplads_comp["constituency_name"]}),
        pd.DataFrame({"title": df_nirikshan_rec["work_title"], "constituency": df_nirikshan_rec["constituency"]}),
        pd.DataFrame({"title": df_nirikshan_comp["work_title"], "constituency": df_nirikshan_comp["constituency"]})
    ], ignore_index=True).dropna(subset=["title"])

    all_titles_df["clean_title"] = all_titles_df["title"].astype(str).str.strip().str.upper()
    title_con_counts = all_titles_df.groupby(["clean_title", "constituency"]).size().to_dict()
    title_total_counts = all_titles_df.groupby("clean_title").size().to_dict()

    con_totals = df_mplads_rec["constituency_name"].value_counts().to_dict()
    constituency_loc_shares = {}
    for (con, loc), group in df_mplads_rec.groupby(["constituency_name", "village"]):
        loc_str = str(loc) if pd.notna(loc) else "UNKNOWN"
        con_str = str(con) if pd.notna(con) else "UNKNOWN"
        con_total = con_totals.get(con, 0)
        if con_total > 0:
            constituency_loc_shares[(con_str, loc_str)] = len(group) / con_total

    mplads_bursts = df_mplads_rec.groupby(["mp_name", "recommended_date"]).size().to_dict()
    nirikshan_bursts = df_nirikshan_rec.groupby(["mp_name", "recommendation_date"]).size().to_dict()

    results_to_insert = []
    high_count = 0
    critical_count = 0
    run_id = str(uuid.uuid4())

    def get_text_context(title: str, con: str):
        clean_t = str(title).strip().upper() if title else ""
        if not clean_t:
            return 0, 0
        tot = title_total_counts.get(clean_t, 0)
        same_c = title_con_counts.get((clean_t, con), 0)
        diff_c = max(0, tot - same_c)
        return same_c, diff_c

    # -------------------------------------------------------------------------
    # 5. EVALUATE RISK: MPLADS RECOMMENDED WORKS (60,359)
    # -------------------------------------------------------------------------
    print("Evaluating risk scores for MPLADS recommended works...")
    for row in df_mplads_rec.itertuples(index=False):
        s_id = int(row.source_row_id)
        title = str(row.work_title) if pd.notna(row.work_title) else ""
        cat = str(row.category) if pd.notna(row.category) else "UNKNOWN"
        st = str(row.state_name) if pd.notna(row.state_name) else "UNKNOWN"
        con = str(row.constituency_name) if pd.notna(row.constituency_name) else "UNKNOWN"
        ida = str(row.ida_name) if pd.notna(row.ida_name) else "UNKNOWN"
        house = str(row.house) if pd.notna(row.house) else "UNKNOWN"
        amt = float(row.allocation_amount) if pd.notna(row.allocation_amount) else 0.0
        rec_date = row.recommended_date
        mp = str(row.mp_name) if pd.notna(row.mp_name) else ""
        loc = str(row.village) if pd.notna(row.village) else (str(row.ward) if pd.notna(row.ward) else "")
        status = str(row.work_status) if pd.notna(row.work_status) else ""

        p_stats = peer_benchmarker.get_peer_stats(cat, st, con, ida_name=ida, house_of_parliament=house)
        fin_eval = analyze_financial_anomaly(amt, p_stats, recommended_amount=amt)

        same_c, diff_c = get_text_context(title, con)
        text_eval = evaluate_description_context(title, con, rec_date, [], same_c, diff_c)

        loc_share = constituency_loc_shares.get((con, loc), 0.1)
        geo_eval = evaluate_geo_intelligence(loc, con, st, 0.2, loc_share)

        burst = mplads_bursts.get((mp, rec_date), 1)
        temp_eval = evaluate_temporal_and_status(rec_date, None, status, amt, burst)

        comp_eval = evaluate_compliance_rules(fin_eval, temp_eval, text_eval, geo_eval)
        pred_eval = evaluate_predictive_early_warning(fin_eval, temp_eval, text_eval, geo_eval)
        agency_eval = evaluate_agency_intelligence(ida)

        fused = fuse_risk_scores(fin_eval, text_eval, geo_eval, temp_eval, comp_eval, pred_eval, agency_eval)

        r_level = fused["risk_level"]
        if r_level == "HIGH": high_count += 1
        elif r_level == "CRITICAL": critical_count += 1

        results_to_insert.append((
            run_id, "RECOMMENDED", s_id, None, None, None, 'MPLADS',
            fused["risk_score"], r_level, fused["risk_category"],
            psycopg2.extras.Json(fused["reason_codes"]),
            psycopg2.extras.Json(fused["evidence_json"]),
            psycopg2.extras.Json(fused["feature_values_json"]),
            psycopg2.extras.Json(fused["peer_stats_json"]),
            DETECTOR_VERSION, FEATURE_VERSION
        ))

    # -------------------------------------------------------------------------
    # 6. EVALUATE RISK: MPLADS COMPLETED WORKS (44,028)
    # -------------------------------------------------------------------------
    print("Evaluating risk scores for MPLADS completed works...")
    for row in df_mplads_comp.itertuples(index=False):
        w_id = int(row.work_id)
        title = str(row.work_title) if pd.notna(row.work_title) else ""
        cat = str(row.category) if pd.notna(row.category) else "UNKNOWN"
        st = str(row.state_name) if pd.notna(row.state_name) else "UNKNOWN"
        con = str(row.constituency_name) if pd.notna(row.constituency_name) else "UNKNOWN"
        ida = str(row.ida_name) if pd.notna(row.ida_name) else "UNKNOWN"
        house = str(row.house) if pd.notna(row.house) else "UNKNOWN"
        amt = float(row.allocation_amount) if pd.notna(row.allocation_amount) else 0.0
        comp_date = row.completed_date

        p_stats = peer_benchmarker.get_peer_stats(cat, st, con, ida_name=ida, house_of_parliament=house)
        fin_eval = analyze_financial_anomaly(amt, p_stats, actual_amount=amt)

        same_c, diff_c = get_text_context(title, con)
        text_eval = evaluate_description_context(title, con, None, [], same_c, diff_c)
        geo_eval = evaluate_geo_intelligence("", con, st, 0.2, 0.1)
        temp_eval = evaluate_temporal_and_status(None, comp_date, "COMPLETED", amt, 1, actual_amount=amt)

        comp_eval = evaluate_compliance_rules(fin_eval, temp_eval, text_eval, geo_eval)
        pred_eval = evaluate_predictive_early_warning(fin_eval, temp_eval, text_eval, geo_eval)
        agency_eval = evaluate_agency_intelligence(ida)

        fused = fuse_risk_scores(fin_eval, text_eval, geo_eval, temp_eval, comp_eval, pred_eval, agency_eval)

        r_level = fused["risk_level"]
        if r_level == "HIGH": high_count += 1
        elif r_level == "CRITICAL": critical_count += 1

        results_to_insert.append((
            run_id, "COMPLETED", None, w_id, None, None, 'MPLADS',
            fused["risk_score"], r_level, fused["risk_category"],
            psycopg2.extras.Json(fused["reason_codes"]),
            psycopg2.extras.Json(fused["evidence_json"]),
            psycopg2.extras.Json(fused["feature_values_json"]),
            psycopg2.extras.Json(fused["peer_stats_json"]),
            DETECTOR_VERSION, FEATURE_VERSION
        ))

    # -------------------------------------------------------------------------
    # 7. EVALUATE RISK: NIRIKSHAN RECOMMENDED WORKS (127,282)
    # -------------------------------------------------------------------------
    print("Evaluating risk scores for Nirikshan recommended works...")
    for row in df_nirikshan_rec.itertuples(index=False):
        n_id = int(row.nirikshan_id)
        title = str(row.work_title) if pd.notna(row.work_title) else ""
        cat = str(row.category) if pd.notna(row.category) else "UNKNOWN"
        st = str(row.state_name) if pd.notna(row.state_name) else "UNKNOWN"
        con = str(row.constituency) if pd.notna(row.constituency) else "UNKNOWN"
        ida = str(row.ida_name) if pd.notna(row.ida_name) else "UNKNOWN"
        house = str(row.house_of_parliament) if pd.notna(row.house_of_parliament) else "UNKNOWN"
        rec_amt = float(row.recommended_amount) if pd.notna(row.recommended_amount) else None
        sanc_amt = float(row.sanction_amount) if pd.notna(row.sanction_amount) else None
        rec_date = row.recommendation_date
        sanc_date = row.sanction_date
        mp = str(row.mp_name) if pd.notna(row.mp_name) else ""
        stage = str(row.work_stage) if pd.notna(row.work_stage) else ""

        p_stats = peer_benchmarker.get_peer_stats(cat, st, con, ida_name=ida, house_of_parliament=house)
        fin_eval = analyze_financial_anomaly(
            rec_amt or sanc_amt or 0.0, p_stats, 
            recommended_amount=rec_amt, sanction_amount=sanc_amt
        )

        same_c, diff_c = get_text_context(title, con)
        text_eval = evaluate_description_context(title, con, rec_date, [], same_c, diff_c)

        geo_eval = evaluate_geo_intelligence("", con, st, 0.2, 0.1)

        burst = nirikshan_bursts.get((mp, rec_date), 1)
        temp_eval = evaluate_temporal_and_status(
            rec_date, None, stage, rec_amt or sanc_amt or 0.0, burst,
            sanction_date=sanc_date, sanction_amount=sanc_amt
        )

        comp_eval = evaluate_compliance_rules(fin_eval, temp_eval, text_eval, geo_eval)
        pred_eval = evaluate_predictive_early_warning(fin_eval, temp_eval, text_eval, geo_eval)
        agency_eval = evaluate_agency_intelligence(ida)

        fused = fuse_risk_scores(fin_eval, text_eval, geo_eval, temp_eval, comp_eval, pred_eval, agency_eval)

        r_level = fused["risk_level"]
        if r_level == "HIGH": high_count += 1
        elif r_level == "CRITICAL": critical_count += 1

        results_to_insert.append((
            run_id, "NIRIKSHAN_RECOMMENDED", None, None, n_id, None, 'NIRIKSHAN',
            fused["risk_score"], r_level, fused["risk_category"],
            psycopg2.extras.Json(fused["reason_codes"]),
            psycopg2.extras.Json(fused["evidence_json"]),
            psycopg2.extras.Json(fused["feature_values_json"]),
            psycopg2.extras.Json(fused["peer_stats_json"]),
            DETECTOR_VERSION, FEATURE_VERSION
        ))

    # -------------------------------------------------------------------------
    # 8. EVALUATE RISK: NIRIKSHAN COMPLETED WORKS (43,697)
    # -------------------------------------------------------------------------
    print("Evaluating risk scores for Nirikshan completed works...")
    for row in df_nirikshan_comp.itertuples(index=False):
        n_comp_id = int(row.nirikshan_id)
        title = str(row.work_title) if pd.notna(row.work_title) else ""
        cat = str(row.category) if pd.notna(row.category) else "UNKNOWN"
        st = str(row.state_name) if pd.notna(row.state_name) else "UNKNOWN"
        con = str(row.constituency) if pd.notna(row.constituency) else "UNKNOWN"
        ida = str(row.ida_name) if pd.notna(row.ida_name) else "UNKNOWN"
        house = str(row.house_of_parliament) if pd.notna(row.house_of_parliament) else "UNKNOWN"
        
        act_amt = float(row.actual_amount) if pd.notna(row.actual_amount) else None
        rec_amt = float(row.recommended_amount) if pd.notna(row.recommended_amount) else None
        sanc_amt = float(row.sanction_amount) if pd.notna(row.sanction_amount) else None

        rec_date = row.recommendation_date
        sanc_date = row.sanction_date
        act_date = row.actual_end_date
        stage = str(row.work_stage) if pd.notna(row.work_stage) else "COMPLETED"

        p_stats = peer_benchmarker.get_peer_stats(cat, st, con, ida_name=ida, house_of_parliament=house)
        fin_eval = analyze_financial_anomaly(
            act_amt or sanc_amt or rec_amt or 0.0, p_stats,
            recommended_amount=rec_amt, sanction_amount=sanc_amt, actual_amount=act_amt
        )

        same_c, diff_c = get_text_context(title, con)
        text_eval = evaluate_description_context(title, con, rec_date, [], same_c, diff_c)

        geo_eval = evaluate_geo_intelligence("", con, st, 0.2, 0.1)

        temp_eval = evaluate_temporal_and_status(
            rec_date, act_date, stage, act_amt or sanc_amt or 0.0, 1,
            sanction_date=sanc_date, sanction_amount=sanc_amt, actual_amount=act_amt
        )

        comp_eval = evaluate_compliance_rules(fin_eval, temp_eval, text_eval, geo_eval)
        pred_eval = evaluate_predictive_early_warning(fin_eval, temp_eval, text_eval, geo_eval)
        agency_eval = evaluate_agency_intelligence(ida)

        fused = fuse_risk_scores(fin_eval, text_eval, geo_eval, temp_eval, comp_eval, pred_eval, agency_eval)

        r_level = fused["risk_level"]
        if r_level == "HIGH": high_count += 1
        elif r_level == "CRITICAL": critical_count += 1

        results_to_insert.append((
            run_id, "NIRIKSHAN_COMPLETED", None, None, None, n_comp_id, 'NIRIKSHAN',
            fused["risk_score"], r_level, fused["risk_category"],
            psycopg2.extras.Json(fused["reason_codes"]),
            psycopg2.extras.Json(fused["evidence_json"]),
            psycopg2.extras.Json(fused["feature_values_json"]),
            psycopg2.extras.Json(fused["peer_stats_json"]),
            DETECTOR_VERSION, FEATURE_VERSION
        ))

    end_time = time.time()
    duration = float(end_time - start_time)

    # Dedup safety net: unique key is (run_id[0]=col1, work_type[1], source_row_id[2]/nirikshan_completed_id[6])
    seen_keys = set()
    deduped = []
    for row in results_to_insert:
        wtype = row[1]
        if wtype == "NIRIKSHAN_COMPLETED":
            key = (wtype, row[5])
        elif wtype == "NIRIKSHAN_RECOMMENDED":
            key = (wtype, row[4])
        elif wtype == "COMPLETED":
            key = (wtype, row[3])
        else:
            key = (wtype, row[2])
        if key not in seen_keys:
            seen_keys.add(key)
            deduped.append(row)
    if len(deduped) < len(results_to_insert):
        print(f"  [WARN] Dropped {len(results_to_insert) - len(deduped):,} duplicate entries before insert.")
    results_to_insert = deduped
    total_processed = len(results_to_insert)

    print(f"\nRisk evaluation complete in {duration:.2f} seconds ({total_processed:,} total works processed across MPLADS & Nirikshan).")
    print(f"Summary: High Risk: {high_count:,} | Critical Risk: {critical_count:,}")

    # -------------------------------------------------------------------------
    # 9. WRITE RUN LINEAGE & BULK INSERT ANOMALY RESULTS
    # -------------------------------------------------------------------------
    print("Writing risk_runs entry and bulk inserting risk_anomaly_results...")
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO public.risk_runs (
            run_id, detector_version, feature_version, source_data_version,
            processed_count, high_risk_count, critical_risk_count, duration_seconds
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
    """, (
        run_id, DETECTOR_VERSION, FEATURE_VERSION, SOURCE_DATA_VERSION,
        total_processed, high_count, critical_count, round(duration, 2)
    ))

    insert_sql = """
        INSERT INTO public.risk_anomaly_results (
            run_id, work_type, source_row_id, work_id, nirikshan_id, nirikshan_completed_id, source_dataset,
            risk_score, risk_level, risk_category, reason_codes, evidence_json, feature_values_json,
            peer_stats_json, detector_version, feature_version
        ) VALUES %s;
    """

    psycopg2.extras.execute_values(
        cur, insert_sql, results_to_insert, page_size=5000
    )

    conn.commit()
    cur.close()
    if close_conn:
        conn.close()

    print("Pipeline commit successful! Run ID:", run_id)
    print("=" * 80)

    summary = {
        "run_id": run_id,
        "processed_count": total_processed,
        "high_risk_count": high_count,
        "critical_risk_count": critical_count,
        "duration_seconds": round(duration, 2)
    }

    return run_id, summary

if __name__ == "__main__":
    run_intelligence_pipeline()
