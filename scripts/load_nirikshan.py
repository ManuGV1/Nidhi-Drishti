import os
import sys
import json
import psycopg2
import psycopg2.extras
from datetime import datetime


# ============================================================
# NIDHI DRISHTI - NIRIKSHAN REAL DATA LOADER
# ============================================================
# Purpose:
#   Load the four real Nirikshan JSON snapshots into PostgreSQL
#   without touching the existing MPLADS CSV tables.
#
# Sources:
#   ls-works-recommended.json
#   ls-works-completed.json
#   rs-works-recommended.json
#   rs-works-completed.json
# ============================================================


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


# ------------------------------------------------------------
# PATHS
# ------------------------------------------------------------

BASE_DIR = r"D:\NidhiDristi"

NIRIKSHAN_DIR = os.path.join(
    BASE_DIR,
    "Data",
    "raw",
    "nirikshan_real"
)


# ------------------------------------------------------------
# DATABASE CONFIG
# ------------------------------------------------------------

DB_NAME = "nidhidrishti"
DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "postgres"
DB_PASSWORD = ""


# ------------------------------------------------------------
# SOURCE FILES
# ------------------------------------------------------------

FILES = {
    "LS_RECOMMENDED": "ls-works-recommended.json",
    "LS_COMPLETED": "ls-works-completed.json",
    "RS_RECOMMENDED": "rs-works-recommended.json",
    "RS_COMPLETED": "rs-works-completed.json",
}


# ============================================================
# HELPERS
# ============================================================

def clean_text(value):
    """Convert empty strings to NULL."""
    if value is None:
        return None

    if isinstance(value, str):
        value = value.strip()

        if value == "":
            return None

    return value


def clean_number(value):
    """Convert numeric values safely."""
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return value

    if isinstance(value, str):
        value = value.strip()

        if value == "":
            return None

        # Remove common formatting
        value = value.replace(",", "")
        value = value.replace("₹", "")

        try:
            return float(value)
        except ValueError:
            return None

    return None


def clean_date(value):
    """Convert supported date formats to PostgreSQL date-compatible strings."""
    if value is None:
        return None

    if isinstance(value, str):
        value = value.strip()

        if not value:
            return None

        # ISO datetime
        try:
            return datetime.fromisoformat(
                value.replace("Z", "+00:00")
            ).date().isoformat()
        except ValueError:
            pass

        # Common date formats
        formats = [
            "%Y-%m-%d",
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%Y/%m/%d",
            "%d-%b-%Y",
            "%d/%b/%Y",
            "%b %d, %Y %I:%M:%S %p",
            "%b %d, %Y %H:%M:%S %p",
            "%Y-%m-%dT%H:%M:%S",
        ]

        for fmt in formats:
            try:
                return datetime.strptime(value, fmt).date().isoformat()
            except ValueError:
                continue

    return None


def load_json(filename):
    """Load a JSON file."""
    path = os.path.join(NIRIKSHAN_DIR, filename)

    print()
    print("-" * 80)
    print(f"Reading: {path}")

    if not os.path.exists(path):
        raise FileNotFoundError(
            f"File not found:\n{path}"
        )

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict):
        # Some exports may wrap records inside a common key.
        for key in ["data", "works", "records", "results"]:
            if key in data and isinstance(data[key], list):
                data = data[key]
                break

    if not isinstance(data, list):
        raise ValueError(
            f"{filename} does not contain a JSON list of records."
        )

    print(f"Records found: {len(data):,}")

    return data


# ============================================================
# DATABASE TABLES
# ============================================================

def create_tables(cur):

    print()
    print("=" * 80)
    print("CREATING NIRIKSHAN TABLES")
    print("=" * 80)

    # --------------------------------------------------------
    # Recommended works
    # --------------------------------------------------------

    cur.execute("""
        CREATE TABLE IF NOT EXISTS public.nirikshan_recommended (
            nirikshan_id BIGSERIAL PRIMARY KEY,

            recommendation_detail_id TEXT,
            work_id TEXT,

            activity_name TEXT,
            work_description TEXT,
            work_category TEXT,

            state_name TEXT,
            constituency TEXT,
            constituency_id TEXT,
            house_of_parliament TEXT,

            tenure TEXT,
            mp_name TEXT,
            ida_name TEXT,

            letter_no TEXT,
            recommendation_date DATE,
            recommended_amount NUMERIC(18,2),

            sanction_date DATE,
            sanction_amount NUMERIC(18,2),

            work_stage TEXT,
            flag TEXT,

            house_code INTEGER,

            source_file VARCHAR(255) NOT NULL,
            source_row_number INTEGER NOT NULL,

            ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

            UNIQUE(source_file, source_row_number)
        );
    """)

    # --------------------------------------------------------
    # Completed works
    # --------------------------------------------------------

    cur.execute("""
        CREATE TABLE IF NOT EXISTS public.nirikshan_completed (
            nirikshan_id BIGSERIAL PRIMARY KEY,

            recommendation_detail_id TEXT,
            work_id TEXT,

            activity_name TEXT,
            work_description TEXT,
            work_category TEXT,

            state_name TEXT,
            constituency TEXT,
            constituency_id TEXT,
            house_of_parliament TEXT,

            tenure TEXT,
            mp_name TEXT,
            ida_name TEXT,

            letter_no TEXT,
            recommendation_date DATE,
            recommended_amount NUMERIC(18,2),

            sanction_date DATE,
            sanction_amount NUMERIC(18,2),

            actual_end_date DATE,
            actual_amount NUMERIC(18,2),

            flag TEXT,

            house_code INTEGER,

            source_file VARCHAR(255) NOT NULL,
            source_row_number INTEGER NOT NULL,

            ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

            UNIQUE(source_file, source_row_number)
        );
    """)

    # --------------------------------------------------------
    # Indexes
    # --------------------------------------------------------

    cur.execute("""
        CREATE INDEX IF NOT EXISTS
        idx_nirikshan_rec_work_id
        ON public.nirikshan_recommended(work_id);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS
        idx_nirikshan_rec_state
        ON public.nirikshan_recommended(state_name);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS
        idx_nirikshan_rec_mp
        ON public.nirikshan_recommended(mp_name);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS
        idx_nirikshan_rec_date
        ON public.nirikshan_recommended(recommendation_date);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS
        idx_nirikshan_comp_work_id
        ON public.nirikshan_completed(work_id);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS
        idx_nirikshan_comp_state
        ON public.nirikshan_completed(state_name);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS
        idx_nirikshan_comp_mp
        ON public.nirikshan_completed(mp_name);
    """)

    cur.execute("""
        CREATE INDEX IF NOT EXISTS
        idx_nirikshan_comp_date
        ON public.nirikshan_completed(actual_end_date);
    """)

    print("Nirikshan tables and indexes ready.")


# ============================================================
# NORMALIZATION
# ============================================================

def get_value(row, *keys):
    """
    Get the first available value from multiple possible JSON keys.
    This makes the importer tolerant of minor naming differences.
    """

    for key in keys:

        if key in row:
            value = row[key]

            if value is not None:
                return value

    return None


def normalize_recommended(row):

    return (
        clean_text(get_value(
            row,
            "WORK_RECOMMENDATION_DTL_ID",
            "work_recommendation_dtl_id"
        )),

        clean_text(get_value(
            row,
            "WORK_ID",
            "work_id"
        )),

        clean_text(get_value(
            row,
            "ACTIVITY_NAME",
            "activity_name"
        )),

        clean_text(get_value(
            row,
            "WORK_DESCRIPTION",
            "work_description"
        )),

        clean_text(get_value(
            row,
            "WORK_CATEGORY",
            "work_category"
        )),

        clean_text(get_value(
            row,
            "STATE_NAME",
            "state_name"
        )),

        clean_text(get_value(
            row,
            "CONSTITUENCY",
            "constituency"
        )),

        clean_text(get_value(
            row,
            "CONSTITUENCY_ID",
            "constituency_id"
        )),

        clean_text(get_value(
            row,
            "HOUSE_OF_PARLIAMENT",
            "house_of_parliament"
        )),

        clean_text(get_value(
            row,
            "TENURE",
            "tenure"
        )),

        clean_text(get_value(
            row,
            "MP_NAME",
            "mp_name"
        )),

        clean_text(get_value(
            row,
            "IDA_NAME",
            "ida_name"
        )),

        clean_text(get_value(
            row,
            "LETTER_NO",
            "letter_no"
        )),

        clean_date(get_value(
            row,
            "RECOMMENDATION_DATE",
            "recommendation_date"
        )),

        clean_number(get_value(
            row,
            "RECOMMENDED_AMOUNT",
            "recommended_amount"
        )),

        clean_date(get_value(
            row,
            "SANCTION_DATE",
            "sanction_date"
        )),

        clean_number(get_value(
            row,
            "SANCTION_AMOUNT",
            "sanction_amount"
        )),

        clean_text(get_value(
            row,
            "WORK_STAGE",
            "work_stage"
        )),

        clean_text(get_value(
            row,
            "FLAG",
            "flag"
        ))
    )


def normalize_completed(row):

    return (
        clean_text(get_value(
            row,
            "WORK_RECOMMENDATION_DTL_ID",
            "work_recommendation_dtl_id"
        )),

        clean_text(get_value(
            row,
            "WORK_ID",
            "work_id"
        )),

        clean_text(get_value(
            row,
            "ACTIVITY_NAME",
            "activity_name"
        )),

        clean_text(get_value(
            row,
            "WORK_DESCRIPTION",
            "work_description"
        )),

        clean_text(get_value(
            row,
            "WORK_CATEGORY",
            "work_category"
        )),

        clean_text(get_value(
            row,
            "STATE_NAME",
            "state_name"
        )),

        clean_text(get_value(
            row,
            "CONSTITUENCY",
            "constituency"
        )),

        clean_text(get_value(
            row,
            "CONSTITUENCY_ID",
            "constituency_id"
        )),

        clean_text(get_value(
            row,
            "HOUSE_OF_PARLIAMENT",
            "house_of_parliament"
        )),

        clean_text(get_value(
            row,
            "TENURE",
            "tenure"
        )),

        clean_text(get_value(
            row,
            "MP_NAME",
            "mp_name"
        )),

        clean_text(get_value(
            row,
            "IDA_NAME",
            "ida_name"
        )),

        clean_text(get_value(
            row,
            "LETTER_NO",
            "letter_no"
        )),

        clean_date(get_value(
            row,
            "RECOMMENDATION_DATE",
            "recommendation_date"
        )),

        clean_number(get_value(
            row,
            "RECOMMENDED_AMOUNT",
            "recommended_amount"
        )),

        clean_date(get_value(
            row,
            "SANCTION_DATE",
            "sanction_date"
        )),

        clean_number(get_value(
            row,
            "SANCTION_AMOUNT",
            "sanction_amount"
        )),

        clean_date(get_value(
            row,
            "ACTUAL_END_DATE",
            "actual_end_date"
        )),

        clean_number(get_value(
            row,
            "ACTUAL_AMOUNT",
            "actual_amount"
        )),

        clean_text(get_value(
            row,
            "FLAG",
            "flag"
        ))
    )


# ============================================================
# INSERT RECOMMENDED
# ============================================================

def insert_recommended(cur, records, filename, house_code):

    sql = """
        INSERT INTO public.nirikshan_recommended (
            recommendation_detail_id,
            work_id,
            activity_name,
            work_description,
            work_category,
            state_name,
            constituency,
            constituency_id,
            house_of_parliament,
            tenure,
            mp_name,
            ida_name,
            letter_no,
            recommendation_date,
            recommended_amount,
            sanction_date,
            sanction_amount,
            work_stage,
            flag,
            house_code,
            source_file,
            source_row_number
        )
        VALUES %s
        ON CONFLICT (source_file, source_row_number)
        DO UPDATE SET
            recommendation_detail_id = EXCLUDED.recommendation_detail_id,
            work_id = EXCLUDED.work_id,
            activity_name = EXCLUDED.activity_name,
            work_description = EXCLUDED.work_description,
            work_category = EXCLUDED.work_category,
            state_name = EXCLUDED.state_name,
            constituency = EXCLUDED.constituency,
            constituency_id = EXCLUDED.constituency_id,
            house_of_parliament = EXCLUDED.house_of_parliament,
            tenure = EXCLUDED.tenure,
            mp_name = EXCLUDED.mp_name,
            ida_name = EXCLUDED.ida_name,
            letter_no = EXCLUDED.letter_no,
            recommendation_date = EXCLUDED.recommendation_date,
            recommended_amount = EXCLUDED.recommended_amount,
            sanction_date = EXCLUDED.sanction_date,
            sanction_amount = EXCLUDED.sanction_amount,
            work_stage = EXCLUDED.work_stage,
            flag = EXCLUDED.flag,
            house_code = EXCLUDED.house_code,
            ingested_at = CURRENT_TIMESTAMP;
    """

    values = []

    for index, row in enumerate(records, start=1):

        values.append(
            normalize_recommended(row)
            + (
                house_code,
                filename,
                index,
            )
        )

    psycopg2.extras.execute_values(
        cur,
        sql,
        values,
        page_size=5000
    )

    return len(values)


# ============================================================
# INSERT COMPLETED
# ============================================================

def insert_completed(cur, records, filename, house_code):

    sql = """
        INSERT INTO public.nirikshan_completed (
            recommendation_detail_id,
            work_id,
            activity_name,
            work_description,
            work_category,
            state_name,
            constituency,
            constituency_id,
            house_of_parliament,
            tenure,
            mp_name,
            ida_name,
            letter_no,
            recommendation_date,
            recommended_amount,
            sanction_date,
            sanction_amount,
            actual_end_date,
            actual_amount,
            flag,
            house_code,
            source_file,
            source_row_number
        )
        VALUES %s
        ON CONFLICT (source_file, source_row_number)
        DO UPDATE SET
            recommendation_detail_id = EXCLUDED.recommendation_detail_id,
            work_id = EXCLUDED.work_id,
            activity_name = EXCLUDED.activity_name,
            work_description = EXCLUDED.work_description,
            work_category = EXCLUDED.work_category,
            state_name = EXCLUDED.state_name,
            constituency = EXCLUDED.constituency,
            constituency_id = EXCLUDED.constituency_id,
            house_of_parliament = EXCLUDED.house_of_parliament,
            tenure = EXCLUDED.tenure,
            mp_name = EXCLUDED.mp_name,
            ida_name = EXCLUDED.ida_name,
            letter_no = EXCLUDED.letter_no,
            recommendation_date = EXCLUDED.recommendation_date,
            recommended_amount = EXCLUDED.recommended_amount,
            sanction_date = EXCLUDED.sanction_date,
            sanction_amount = EXCLUDED.sanction_amount,
            actual_end_date = EXCLUDED.actual_end_date,
            actual_amount = EXCLUDED.actual_amount,
            flag = EXCLUDED.flag,
            house_code = EXCLUDED.house_code,
            ingested_at = CURRENT_TIMESTAMP;
    """

    values = []

    for index, row in enumerate(records, start=1):

        values.append(
            normalize_completed(row)
            + (
                house_code,
                filename,
                index,
            )
        )

    psycopg2.extras.execute_values(
        cur,
        sql,
        values,
        page_size=5000
    )

    return len(values)


# ============================================================
# VALIDATION
# ============================================================

def validate_counts(cur):

    print()
    print("=" * 80)
    print("NIRIKSHAN DATABASE VALIDATION")
    print("=" * 80)

    cur.execute("""
        SELECT COUNT(*)
        FROM public.nirikshan_recommended;
    """)

    recommended_count = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*)
        FROM public.nirikshan_completed;
    """)

    completed_count = cur.fetchone()[0]

    print(
        f"Nirikshan recommended records : {recommended_count:,}"
    )

    print(
        f"Nirikshan completed records   : {completed_count:,}"
    )

    # --------------------------------------------------------
    # Work ID counts
    # --------------------------------------------------------

    cur.execute("""
        SELECT COUNT(*)
        FROM public.nirikshan_completed
        WHERE work_id IS NOT NULL;
    """)

    completed_with_id = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(DISTINCT work_id)
        FROM public.nirikshan_completed
        WHERE work_id IS NOT NULL;
    """)

    unique_completed_work_ids = cur.fetchone()[0]

    print(
        f"Completed records with Work ID : {completed_with_id:,}"
    )

    print(
        f"Unique completed Work IDs      : {unique_completed_work_ids:,}"
    )

    # --------------------------------------------------------
    # Recommendation IDs
    # --------------------------------------------------------

    cur.execute("""
        SELECT COUNT(*)
        FROM public.nirikshan_recommended
        WHERE recommendation_detail_id IS NOT NULL;
    """)

    rec_ids = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(DISTINCT recommendation_detail_id)
        FROM public.nirikshan_recommended
        WHERE recommendation_detail_id IS NOT NULL;
    """)

    unique_rec_ids = cur.fetchone()[0]

    print(
        f"Recommended IDs present        : {rec_ids:,}"
    )

    print(
        f"Unique recommended IDs         : {unique_rec_ids:,}"
    )

    # --------------------------------------------------------
    # Reconciliation
    # --------------------------------------------------------

    cur.execute("""
        SELECT COUNT(DISTINCT c.recommendation_detail_id)
        FROM public.nirikshan_completed c
        INNER JOIN public.nirikshan_recommended r
            ON r.recommendation_detail_id =
               c.recommendation_detail_id
        WHERE c.recommendation_detail_id IS NOT NULL;
    """)

    matched = cur.fetchone()[0]

    print(
        f"Completed → Recommended matches: {matched:,}"
    )

    # --------------------------------------------------------
    # State coverage
    # --------------------------------------------------------

    cur.execute("""
        SELECT COUNT(DISTINCT state_name)
        FROM public.nirikshan_recommended
        WHERE state_name IS NOT NULL;
    """)

    states = cur.fetchone()[0]

    print(
        f"Recommended states/UTs         : {states}"
    )

    # --------------------------------------------------------
    # Null critical IDs
    # --------------------------------------------------------

    cur.execute("""
        SELECT COUNT(*)
        FROM public.nirikshan_recommended
        WHERE recommendation_detail_id IS NULL;
    """)

    missing_rec_ids = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*)
        FROM public.nirikshan_completed
        WHERE work_id IS NULL;
    """)

    missing_work_ids = cur.fetchone()[0]

    print(
        f"Recommended missing IDs        : {missing_rec_ids:,}"
    )

    print(
        f"Completed missing Work IDs     : {missing_work_ids:,}"
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 80)
    print("NIDHI DRISHTI")
    print("NIRIKSHAN REAL DATA IMPORT")
    print("=" * 80)

    print()
    print(f"Database : {DB_NAME}")
    print(f"Source   : {NIRIKSHAN_DIR}")

    # --------------------------------------------------------
    # Check source directory
    # --------------------------------------------------------

    if not os.path.isdir(NIRIKSHAN_DIR):
        raise FileNotFoundError(
            f"Nirikshan directory not found:\n{NIRIKSHAN_DIR}"
        )

    # --------------------------------------------------------
    # Load JSON files first
    # --------------------------------------------------------

    datasets = {}

    for dataset_name, filename in FILES.items():

        datasets[dataset_name] = load_json(filename)

    # --------------------------------------------------------
    # Connect PostgreSQL
    # --------------------------------------------------------

    print()
    print("Connecting to PostgreSQL...")

    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )

    try:

        with conn.cursor() as cur:

            # ------------------------------------------------
            # Create tables
            # ------------------------------------------------

            create_tables(cur)

            # ------------------------------------------------
            # Load LS recommended
            # House code:
            #   2 = Lok Sabha
            # ------------------------------------------------

            print()
            print("Loading LS recommended...")

            count = insert_recommended(
                cur,
                datasets["LS_RECOMMENDED"],
                FILES["LS_RECOMMENDED"],
                2
            )

            print(f"Loaded: {count:,}")

            # ------------------------------------------------
            # Load RS recommended
            # House code:
            #   1 = Rajya Sabha
            # ------------------------------------------------

            print()
            print("Loading RS recommended...")

            count = insert_recommended(
                cur,
                datasets["RS_RECOMMENDED"],
                FILES["RS_RECOMMENDED"],
                1
            )

            print(f"Loaded: {count:,}")

            # ------------------------------------------------
            # Load LS completed
            # ------------------------------------------------

            print()
            print("Loading LS completed...")

            count = insert_completed(
                cur,
                datasets["LS_COMPLETED"],
                FILES["LS_COMPLETED"],
                2
            )

            print(f"Loaded: {count:,}")

            # ------------------------------------------------
            # Load RS completed
            # ------------------------------------------------

            print()
            print("Loading RS completed...")

            count = insert_completed(
                cur,
                datasets["RS_COMPLETED"],
                FILES["RS_COMPLETED"],
                1
            )

            print(f"Loaded: {count:,}")

            # ------------------------------------------------
            # Validate
            # ------------------------------------------------

            validate_counts(cur)

        # ----------------------------------------------------
        # Commit only after everything succeeds
        # ----------------------------------------------------

        conn.commit()

        print()
        print("=" * 80)
        print("NIRIKSHAN IMPORT COMPLETED SUCCESSFULLY")
        print("=" * 80)

        print()
        print("Existing MPLADS tables were NOT truncated.")
        print("Existing works_all / works_completed data is untouched.")
        print()

    except Exception as e:

        conn.rollback()

        print()
        print("=" * 80)
        print("NIRIKSHAN IMPORT FAILED")
        print("=" * 80)

        print()
        print("Transaction rolled back.")
        print(f"Error: {e}")

        raise

    finally:

        conn.close()

        print()
        print("Database connection closed.")


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()