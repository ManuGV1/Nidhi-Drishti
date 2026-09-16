import os
import sys
import psycopg2
import pandas as pd

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

CLEANED_DIR = r"D:\NidhiDristi\Data\cleaned"

DB_NAME = "nidhidrishti"
DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "postgres"
DB_PASSWORD = ""

def run_validations():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()
    
    print("=" * 80)
    print("STARTING STAGE 2 AUTOMATED DATABASE VALIDATION CHECKLIST (V01 - V14)")
    print("=" * 80)
    
    all_passed = True
    results = []

    def record_test(test_id, test_name, passed, actual, expected, details=""):
        nonlocal all_passed
        status_str = "[PASS]" if passed else "[FAIL]"
        if not passed:
            all_passed = False
        results.append((test_id, test_name, status_str, str(actual), str(expected), details))
        print(f"{test_id} | {test_name:<45} | {status_str} | Actual: {actual} | Expected: {expected}")

    # V01: works_all row count
    cur.execute("SELECT COUNT(*) FROM public.works_all;")
    cnt_v01 = cur.fetchone()[0]
    record_test("V01", "works_all Row Count", cnt_v01 == 60359, f"{cnt_v01:,}", "60,359")

    # V02: works_completed row count
    cur.execute("SELECT COUNT(*) FROM public.works_completed;")
    cnt_v02 = cur.fetchone()[0]
    record_test("V02", "works_completed Row Count", cnt_v02 == 44028, f"{cnt_v02:,}", "44,028")

    # V03: lgd_states row count
    cur.execute("SELECT COUNT(*) FROM public.lgd_states;")
    cnt_v03 = cur.fetchone()[0]
    record_test("V03", "lgd_states Row Count", cnt_v03 == 36, cnt_v03, "36")

    # V04: lgd_districts row count
    cur.execute("SELECT COUNT(*) FROM public.lgd_districts;")
    cnt_v04 = cur.fetchone()[0]
    record_test("V04", "lgd_districts Row Count", cnt_v04 == 785, cnt_v04, "785")

    # V05: lgd_subdistricts row count
    cur.execute("SELECT COUNT(*) FROM public.lgd_subdistricts;")
    cnt_v05 = cur.fetchone()[0]
    record_test("V05", "lgd_subdistricts Row Count", cnt_v05 == 7151, f"{cnt_v05:,}", "7,151")

    # V06: works_all financial total
    df_all_csv = pd.read_csv(os.path.join(CLEANED_DIR, "mplads_all_works.csv"))
    expected_v06 = float(df_all_csv['allocation_amount'].sum())
    cur.execute("SELECT SUM(allocation_amount) FROM public.works_all;")
    actual_v06 = float(cur.fetchone()[0] or 0.0)
    diff_v06 = abs(actual_v06 - expected_v06)
    record_test("V06", "works_all Allocation Financial Total", diff_v06 < 0.01, f"₹{actual_v06:,.2f}", f"₹{expected_v06:,.2f}")

    # V07: works_completed financial total
    df_comp_csv = pd.read_csv(os.path.join(CLEANED_DIR, "mplads_completed_works.csv"))
    expected_v07 = float(df_comp_csv['final_amount'].sum())
    cur.execute("SELECT SUM(final_amount) FROM public.works_completed;")
    actual_v07 = float(cur.fetchone()[0] or 0.0)
    diff_v07 = abs(actual_v07 - expected_v07)
    record_test("V07", "works_completed Final Amount Total", diff_v07 < 0.01, f"₹{actual_v07:,.2f}", f"₹{expected_v07:,.2f}")

    # V08: source_row_id uniqueness
    cur.execute("SELECT COUNT(DISTINCT source_row_id) FROM public.works_all;")
    uniq_v08 = cur.fetchone()[0]
    record_test("V08", "source_row_id Uniqueness in works_all", uniq_v08 == 60359, f"{uniq_v08:,}", "60,359")

    # V09: real Work ID uniqueness
    cur.execute("SELECT COUNT(DISTINCT work_id) FROM public.works_completed;")
    uniq_v09 = cur.fetchone()[0]
    record_test("V09", "Real Work ID Uniqueness in works_completed", uniq_v09 == 44028, f"{uniq_v09:,}", "44,028")

    # V10: foreign-key & polymorphic constraint integrity
    cur.execute("""
        SELECT COUNT(*) FROM public.work_financials
        WHERE NOT (
            (work_type = 'RECOMMENDED' AND source_row_id IS NOT NULL AND work_id IS NULL) OR
            (work_type = 'COMPLETED'   AND work_id IS NOT NULL AND source_row_id IS NULL)
        );
    """)
    violations_v10 = cur.fetchone()[0]
    record_test("V10", "Polymorphic Financial Constraint Integrity", violations_v10 == 0, f"{violations_v10} violations", "0 violations")

    # V11: critical-field validation
    cur.execute("SELECT COUNT(*) FROM public.works_all WHERE mp_name IS NULL OR work_title IS NULL OR state_name IS NULL;")
    nulls_v11 = cur.fetchone()[0]
    record_test("V11", "Critical-Field Non-Null Check", nulls_v11 == 0, f"{nulls_v11} nulls", "0 nulls")

    # V12: date validation
    cur.execute("SELECT COUNT(*) FROM public.works_all WHERE recommended_date IS NOT NULL AND recommended_date < '1990-01-01';")
    invalid_dates_v12 = cur.fetchone()[0]
    record_test("V12", "Recommended Date Range Validation", invalid_dates_v12 == 0, f"{invalid_dates_v12} invalid", "0 invalid")

    # V13: amount validation
    cur.execute("SELECT COUNT(*) FROM public.works_all WHERE allocation_amount < 0;")
    neg_v13 = cur.fetchone()[0]
    record_test("V13", "Allocation Amount Non-Negative Check", neg_v13 == 0, f"{neg_v13} negative", "0 negative")

    # V14: provenance completeness
    cur.execute("SELECT COUNT(*) FROM public.works_all WHERE source_file IS NULL OR source_row_id IS NULL OR ingested_at IS NULL;")
    prov_v14 = cur.fetchone()[0]
    record_test("V14", "Provenance Completeness (source_file+id+time)", prov_v14 == 0, f"{prov_v14} missing", "0 missing")

    cur.close()
    conn.close()

    print("=" * 80)
    if all_passed:
        print("ALL 14 VALIDATION TESTS (V01 - V14) PASSED WITH 100% SUCCESS!")
        print("=" * 80)
        sys.exit(0)
    else:
        print("SOME VALIDATION TESTS FAILED. PLEASE REVIEW LOGS.")
        print("=" * 80)
        sys.exit(1)

if __name__ == '__main__':
    run_validations()
