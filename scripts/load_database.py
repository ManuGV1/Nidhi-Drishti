import os
import sys
import csv
import psycopg2
import psycopg2.extras
import pandas as pd

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

CLEANED_DIR = r"D:\NidhiDristi\Data\cleaned"
SCHEMA_SQL_PATH = r"D:\NidhiDristi\database\schema.sql"

DB_NAME = "nidhidrishti"
DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "postgres"
DB_PASSWORD = ""

def ensure_database_exists():
    """Step 1: Connect to default postgres DB and ensure nidhidrishti database exists (Outside Transaction)."""
    print(f"Checking database '{DB_NAME}' existence on {DB_HOST}:{DB_PORT}...")
    conn = psycopg2.connect(
        dbname="postgres",
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (DB_NAME,))
    exists = cursor.fetchone()
    if not exists:
        print(f"Creating database '{DB_NAME}'...")
        cursor.execute(f"CREATE DATABASE {DB_NAME};")
        print(f"Database '{DB_NAME}' created successfully.")
    else:
        print(f"Database '{DB_NAME}' already exists.")
    cursor.close()
    conn.close()

def load_data():
    """Step 2: Connect to nidhidrishti DB, apply schema, and load data inside a transaction."""
    ensure_database_exists()
    
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    
    try:
        # Apply schema DDL (CREATE TABLE IF NOT EXISTS)
        print(f"Applying schema DDL from {SCHEMA_SQL_PATH}...")
        with open(SCHEMA_SQL_PATH, 'r', encoding='utf-8') as f:
            ddl = f.read()
            
        with conn.cursor() as cur:
            cur.execute(ddl)
        conn.commit()
        print("Schema DDL applied successfully.")
        
        # Start transactional data loading
        print("Beginning transactional data loading...")
        with conn.cursor() as cur:
            # Controlled TRUNCATE on all staging and core tables simultaneously
            cur.execute("""
                TRUNCATE TABLE stg.stg_mplads_all_works, stg.stg_mplads_completed_works,
                               stg.stg_lgd_states, stg.stg_lgd_districts, stg.stg_lgd_subdistricts,
                               public.work_progress, public.procurement_tenders, public.contracts,
                               public.payment_transactions, public.work_documents, public.risk_anomaly_results,
                               public.contractors, public.work_financials, public.works_completed,
                               public.works_all, public.lgd_subdistricts, public.lgd_districts,
                               public.lgd_states, public.implementing_agencies, public.constituencies,
                               public.members_of_parliament RESTART IDENTITY;
            """)
            
            # 1. Load 04_lgd_states.csv
            states_csv = os.path.join(CLEANED_DIR, "04_lgd_states.csv")
            print(f"Loading {states_csv}...")
            df_states = pd.read_csv(states_csv)
            for idx, r in df_states.iterrows():
                cur.execute("""
                    INSERT INTO public.lgd_states (state_code, state_name_english, state_name_local, state_census2011_code, state_or_ut, last_updated)
                    VALUES (%s, %s, %s, %s, %s, %s);
                """, (
                    int(r['state_code']),
                    str(r['state_name_english']),
                    str(r['state_name_local']) if pd.notnull(r['state_name_local']) else None,
                    int(r['state_census2011_code']) if pd.notnull(r['state_census2011_code']) else None,
                    str(r['state_or_ut']),
                    str(r['last_updated']) if pd.notnull(r['last_updated']) else None
                ))
            print(f"  -> Loaded {len(df_states)} states.")

            # 2. Load 03_lgd_districts.csv
            districts_csv = os.path.join(CLEANED_DIR, "03_lgd_districts.csv")
            print(f"Loading {districts_csv}...")
            df_districts = pd.read_csv(districts_csv)
            for idx, r in df_districts.iterrows():
                cur.execute("""
                    INSERT INTO public.lgd_districts (district_code, state_code, district_name_english, district_name_local, district_census2011_code)
                    VALUES (%s, %s, %s, %s, %s);
                """, (
                    int(r['district_code']),
                    int(r['state_code']),
                    str(r['district_name_english']),
                    str(r['district_name_local']) if pd.notnull(r['district_name_local']) else None,
                    int(r['district_census2011_code']) if pd.notnull(r['district_census2011_code']) else None
                ))
            print(f"  -> Loaded {len(df_districts)} districts.")

            # 3. Load 05_lgd_subdistricts.csv
            subdistricts_csv = os.path.join(CLEANED_DIR, "05_lgd_subdistricts.csv")
            print(f"Loading {subdistricts_csv}...")
            df_subdistricts = pd.read_csv(subdistricts_csv)
            for idx, r in df_subdistricts.iterrows():
                cur.execute("""
                    INSERT INTO public.lgd_subdistricts (subdistrict_code, district_code, state_code, subdistrict_name_english, subdistrict_name_local)
                    VALUES (%s, %s, %s, %s, %s);
                """, (
                    int(r['subdistrict_code']),
                    int(r['district_code']),
                    int(r['state_code']),
                    str(r['subdistrict_name_english']),
                    str(r['subdistrict_name_local']) if pd.notnull(r['subdistrict_name_local']) else None
                ))
            print(f"  -> Loaded {len(df_subdistricts)} subdistricts.")

            # 4. Bulk Load mplads_all_works.csv into works_all (60,359 rows)
            works_all_csv = os.path.join(CLEANED_DIR, "mplads_all_works.csv")
            print(f"Bulk loading {works_all_csv} into works_all (60,359 rows)...")
            df_works_all = pd.read_csv(works_all_csv)
            
            works_tuples = []
            for idx, r in df_works_all.iterrows():
                source_row_id = idx + 1
                works_tuples.append((
                    source_row_id,
                    'mplads_all_works.csv',
                    str(r['mp_name']),
                    str(r['work']),
                    str(r['category']) if pd.notnull(r['category']) else None,
                    str(r['state']),
                    str(r['constituency']),
                    str(r['ida']),
                    str(r['city']) if pd.notnull(r['city']) else None,
                    str(r['ward']) if pd.notnull(r['ward']) else None,
                    str(r['block']) if pd.notnull(r['block']) else None,
                    str(r['village']) if pd.notnull(r['village']) else None,
                    str(r['recommended_date']) if pd.notnull(r['recommended_date']) else None,
                    float(r['allocation_amount']) if pd.notnull(r['allocation_amount']) else 0.0,
                    str(r['ida_approval']) if pd.notnull(r['ida_approval']) else None,
                    str(r['status']) if pd.notnull(r['status']) else None,
                    str(r['house']) if pd.notnull(r['house']) else None
                ))
                
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO public.works_all (
                    source_row_id, source_file, mp_name, work_title, category, state_name, constituency_name,
                    ida_name, city, ward, block, village, recommended_date, allocation_amount,
                    ida_approval_status, work_status, house
                ) VALUES %s;
                """,
                works_tuples,
                page_size=5000
            )
            print(f"  -> Successfully loaded {len(works_tuples):,} rows into works_all.")

            # 5. Bulk Load mplads_completed_works.csv into works_completed (44,028 rows)
            completed_csv = os.path.join(CLEANED_DIR, "mplads_completed_works.csv")
            print(f"Bulk loading {completed_csv} into works_completed (44,028 rows)...")
            df_completed = pd.read_csv(completed_csv)
            
            completed_tuples = []
            for idx, r in df_completed.iterrows():
                source_row_id = idx + 1
                completed_tuples.append((
                    int(r['work_id']),
                    'mplads_completed_works.csv',
                    source_row_id,
                    str(r['work_description']) if pd.notnull(r['work_description']) else None,
                    str(r['category']) if pd.notnull(r['category']) else None,
                    str(r['mp_name']),
                    str(r['constituency']),
                    str(r['state']),
                    str(r['house']),
                    float(r['final_amount']) if pd.notnull(r['final_amount']) else 0.0,
                    str(r['completed_date']) if pd.notnull(r['completed_date']) else None,
                    bool(r['has_images']),
                    float(r['average_rating']) if pd.notnull(r['average_rating']) else None,
                    str(r['ida'])
                ))
                
            psycopg2.extras.execute_values(
                cur,
                """
                INSERT INTO public.works_completed (
                    work_id, source_file, source_row_id, work_description, category, mp_name,
                    constituency_name, state_name, house, final_amount, completed_date,
                    has_images, average_rating, ida_name
                ) VALUES %s;
                """,
                completed_tuples,
                page_size=5000
            )
            print(f"  -> Successfully loaded {len(completed_tuples):,} rows into works_completed.")

            # 6. Populate work_financials (Polymorphic FK table)
            print("Populating polymorphic work_financials table...")
            cur.execute("""
                INSERT INTO public.work_financials (work_type, source_row_id, work_id, allocated_amount, final_amount, currency, source_file)
                SELECT 'RECOMMENDED', source_row_id, NULL, allocation_amount, NULL, 'INR', source_file
                FROM public.works_all;
            """)
            rec_fin_cnt = cur.rowcount
            
            cur.execute("""
                INSERT INTO public.work_financials (work_type, source_row_id, work_id, allocated_amount, final_amount, currency, source_file)
                SELECT 'COMPLETED', NULL, work_id, NULL, final_amount, 'INR', source_file
                FROM public.works_completed;
            """)
            comp_fin_cnt = cur.rowcount
            print(f"  -> Loaded {rec_fin_cnt:,} RECOMMENDED and {comp_fin_cnt:,} COMPLETED financial records.")

        conn.commit()
        print("TRANSACTION COMMITTED SUCCESSFULLY. Data load complete!")
        
    except Exception as e:
        conn.rollback()
        print("ERROR OCCURRED DURING LOAD. Transaction rolled back cleanly.")
        raise e
    finally:
        conn.close()

if __name__ == '__main__':
    load_data()
