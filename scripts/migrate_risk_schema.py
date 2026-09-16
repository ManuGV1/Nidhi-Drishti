import psycopg2

def migrate_risk_schema():
    conn = psycopg2.connect(dbname='nidhidrishti', user='postgres', password='', host='localhost', port=5432)
    cur = conn.cursor()
    
    print("=" * 80)
    print("MIGRATING RISK_ANOMALY_RESULTS SCHEMA FOR NIRIKSHAN INTEGRATION")
    print("=" * 80)

    # 1. Add columns if they do not exist
    cur.execute("""
        ALTER TABLE public.risk_anomaly_results
        ADD COLUMN IF NOT EXISTS nirikshan_id BIGINT REFERENCES public.nirikshan_recommended(nirikshan_id),
        ADD COLUMN IF NOT EXISTS nirikshan_completed_id BIGINT REFERENCES public.nirikshan_completed(nirikshan_id),
        ADD COLUMN IF NOT EXISTS source_dataset VARCHAR(50) DEFAULT 'MPLADS';
    """)
    print("Added nirikshan_id, nirikshan_completed_id, and source_dataset columns.")

    # 2. Drop existing restrictive CHECK constraints
    cur.execute("""
        ALTER TABLE public.risk_anomaly_results
        DROP CONSTRAINT IF EXISTS chk_risk_target,
        DROP CONSTRAINT IF EXISTS risk_anomaly_results_work_type_check,
        DROP CONSTRAINT IF EXISTS uq_risk_run_recommended,
        DROP CONSTRAINT IF EXISTS uq_risk_run_completed;
    """)
    print("Dropped old check and unique constraints.")

    # 3. Add new flexible CHECK constraints
    cur.execute("""
        ALTER TABLE public.risk_anomaly_results
        ADD CONSTRAINT chk_risk_work_type CHECK (
            work_type IN ('RECOMMENDED', 'COMPLETED', 'NIRIKSHAN_RECOMMENDED', 'NIRIKSHAN_COMPLETED')
        ),
        ADD CONSTRAINT chk_risk_target CHECK (
            (work_type = 'RECOMMENDED' AND source_row_id IS NOT NULL) OR
            (work_type = 'COMPLETED' AND work_id IS NOT NULL) OR
            (work_type = 'NIRIKSHAN_RECOMMENDED' AND nirikshan_id IS NOT NULL) OR
            (work_type = 'NIRIKSHAN_COMPLETED' AND nirikshan_completed_id IS NOT NULL)
        );
    """)
    print("Added updated flexible CHECK constraints.")

    # 4. Add unique index constraints per run_id
    cur.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS uq_risk_run_recommended 
        ON public.risk_anomaly_results (run_id, source_row_id) 
        WHERE source_row_id IS NOT NULL;

        CREATE UNIQUE INDEX IF NOT EXISTS uq_risk_run_completed 
        ON public.risk_anomaly_results (run_id, work_id) 
        WHERE work_id IS NOT NULL;

        CREATE UNIQUE INDEX IF NOT EXISTS uq_risk_run_nirikshan_rec 
        ON public.risk_anomaly_results (run_id, nirikshan_id) 
        WHERE nirikshan_id IS NOT NULL;

        CREATE UNIQUE INDEX IF NOT EXISTS uq_risk_run_nirikshan_comp 
        ON public.risk_anomaly_results (run_id, nirikshan_completed_id) 
        WHERE nirikshan_completed_id IS NOT NULL;
    """)
    print("Added partial unique indexes for all 4 work types.")

    conn.commit()
    cur.close()
    conn.close()

    print("Schema migration completed successfully.")

if __name__ == '__main__':
    migrate_risk_schema()
