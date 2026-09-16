import psycopg2
import json

conn = psycopg2.connect(dbname='nidhidrishti', user='postgres', password='', host='localhost', port=5432)
cur = conn.cursor()

# Get the latest inserted run_id by executed_at or primary key
cur.execute("SELECT run_id FROM public.risk_runs ORDER BY executed_at DESC LIMIT 1;")
latest_run_id = cur.fetchone()[0]

print("=" * 80)
print("COMPREHENSIVE INTELLIGENCE PIPELINE AUDIT REPORT")
print("=" * 80)

cur.execute("""
    SELECT run_id, detector_version, feature_version, source_data_version, processed_count, high_risk_count, critical_risk_count, duration_seconds, executed_at
    FROM public.risk_runs
    WHERE run_id = %s;
""", (latest_run_id,))
run = cur.fetchone()
print(f"Target Run ID            : {run[0]}")
print(f"Detector / Feature Ver   : {run[1]} / {run[2]}")
print(f"Source Data Version      : {run[3]}")
print(f"Total Processed Works    : {run[4]:,}")
print(f"High Risk Count          : {run[5]:,}")
print(f"Critical Risk Count      : {run[6]:,}")
print(f"Execution Duration       : {run[7]} seconds")
print(f"Executed At              : {run[8]}")

# 2. Risk Level Distribution
print("\n--- RISK LEVEL DISTRIBUTION ---")
cur.execute("""
    SELECT risk_level, COUNT(*), ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as pct
    FROM public.risk_anomaly_results
    WHERE run_id = %s
    GROUP BY risk_level
    ORDER BY CASE risk_level WHEN 'LOW' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'HIGH' THEN 3 WHEN 'CRITICAL' THEN 4 END;
""", (latest_run_id,))
for level, cnt, pct in cur.fetchall():
    print(f"  {level:<10}: {cnt:>8,} ({pct:>5.2f}%)")

# 3. Source Dataset Provenance Breakdown
print("\n--- PROVENANCE BREAKDOWN BY WORK TYPE & DATASET ---")
cur.execute("""
    SELECT source_dataset, work_type, COUNT(*)
    FROM public.risk_anomaly_results
    WHERE run_id = %s
    GROUP BY source_dataset, work_type
    ORDER BY source_dataset, work_type;
""", (latest_run_id,))
for ds, wt, cnt in cur.fetchall():
    print(f"  {ds:<10} | {wt:<25} : {cnt:>8,}")

# 4. Reason Codes Frequency Analysis
print("\n--- REASON CODES FREQUENCY ---")
cur.execute("""
    SELECT jsonb_array_elements_text(reason_codes) as code, COUNT(*) as frequency
    FROM public.risk_anomaly_results
    WHERE run_id = %s
    GROUP BY code
    ORDER BY frequency DESC;
""", (latest_run_id,))
for code, freq in cur.fetchall():
    print(f"  {code:<32} : {freq:>8,}")

# 5. Risk Score Range & Out-of-Bounds Safeguard Check
print("\n--- RISK SCORE RANGE & BOUNDS VALIDATION ---")
cur.execute("""
    SELECT MIN(risk_score), MAX(risk_score), AVG(risk_score),
           COUNT(*) FILTER (WHERE risk_score < 0 OR risk_score > 100) as invalid_scores,
           COUNT(*) FILTER (WHERE risk_score IS NULL) as null_scores
    FROM public.risk_anomaly_results
    WHERE run_id = %s;
""", (latest_run_id,))
min_s, max_s, avg_s, invalid_s, null_s = cur.fetchone()
print(f"  Min Score      : {min_s}")
print(f"  Max Score      : {max_s}")
print(f"  Avg Score      : {round(float(avg_s), 2)}")
print(f"  Invalid Scores : {invalid_s} (Expected: 0)")
print(f"  Null Scores    : {null_s} (Expected: 0)")

# 6. Check for duplicate risk entries per run
print("\n--- DUPLICATE RESULT SAFEGUARD CHECK ---")
cur.execute("""
    SELECT COUNT(*) FROM (
        SELECT run_id, COALESCE(source_row_id::text, '') || '_' || COALESCE(work_id::text, '') || '_' || COALESCE(nirikshan_id::text, '') || '_' || COALESCE(nirikshan_completed_id::text, '') as item_key, COUNT(*)
        FROM public.risk_anomaly_results
        WHERE run_id = %s
        GROUP BY run_id, item_key
        HAVING COUNT(*) > 1
    ) dupes;
""", (latest_run_id,))
dupe_cnt = cur.fetchone()[0]
print(f"  Duplicate Risk Entries : {dupe_cnt} (Expected: 0)")

conn.close()
