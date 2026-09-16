-- NIDHIDRISHTI Stage 2: Database Schema DDL
-- Target Engine: PostgreSQL 18+
-- Target Database: nidhidrishti

CREATE SCHEMA IF NOT EXISTS stg;
CREATE SCHEMA IF NOT EXISTS public;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- 1. STAGING SCHEMA TABLES (stg)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stg.stg_mplads_all_works (
    source_row_id INT PRIMARY KEY,
    mp_name TEXT,
    work TEXT,
    category TEXT,
    state TEXT,
    constituency TEXT,
    ida TEXT,
    city TEXT,
    ward TEXT,
    block TEXT,
    village TEXT,
    recommended_date TEXT,
    allocation_amount TEXT,
    ida_approval TEXT,
    status TEXT,
    house TEXT,
    source_file VARCHAR(255) DEFAULT 'mplads_all_works.csv',
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stg.stg_mplads_completed_works (
    work_id BIGINT PRIMARY KEY,
    source_row_id INT,
    work_description TEXT,
    category TEXT,
    mp_name TEXT,
    constituency TEXT,
    state TEXT,
    house TEXT,
    final_amount TEXT,
    completed_date TEXT,
    has_images TEXT,
    average_rating TEXT,
    ida TEXT,
    source_file VARCHAR(255) DEFAULT 'mplads_completed_works.csv',
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stg.stg_lgd_states (
    state_code INT PRIMARY KEY,
    state_name_english TEXT,
    state_name_local TEXT,
    state_census2011_code TEXT,
    state_or_ut TEXT,
    last_updated TEXT,
    source_file VARCHAR(255) DEFAULT '04_lgd_states.csv',
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stg.stg_lgd_districts (
    district_code INT PRIMARY KEY,
    state_code INT,
    state_name_english TEXT,
    state_name_local TEXT,
    state_census2011_code TEXT,
    district_name_english TEXT,
    district_name_local TEXT,
    district_census2011_code TEXT,
    source_file VARCHAR(255) DEFAULT '03_lgd_districts.csv',
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stg.stg_lgd_subdistricts (
    subdistrict_code INT PRIMARY KEY,
    state_code INT,
    state_name_english TEXT,
    state_name_local TEXT,
    state_census2011_code TEXT,
    district_code INT,
    district_name_english TEXT,
    district_name_local TEXT,
    district_census2011_code TEXT,
    subdistrict_name_english TEXT,
    subdistrict_name_local TEXT,
    subdistrict_census2011_code TEXT,
    last_updated TEXT,
    source_file VARCHAR(255) DEFAULT '05_lgd_subdistricts.csv',
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. CORE SCHEMA MASTER TABLES (public)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lgd_states (
    state_code INT PRIMARY KEY,
    state_name_english VARCHAR(100) NOT NULL,z
    state_name_local VARCHAR(150),
    state_census2011_code INT,
    state_or_ut CHAR(1) NOT NULL,
    last_updated DATE,
    source_file VARCHAR(255) DEFAULT '04_lgd_states.csv',
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.lgd_districts (
    district_code INT PRIMARY KEY,
    state_code INT NOT NULL REFERENCES public.lgd_states(state_code),
    district_name_english VARCHAR(150) NOT NULL,
    district_name_local VARCHAR(200),
    district_census2011_code INT,
    source_file VARCHAR(255) DEFAULT '03_lgd_districts.csv',
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.lgd_subdistricts (
    subdistrict_code INT PRIMARY KEY,
    district_code INT NOT NULL REFERENCES public.lgd_districts(district_code),
    state_code INT NOT NULL REFERENCES public.lgd_states(state_code),
    subdistrict_name_english VARCHAR(150) NOT NULL,
    subdistrict_name_local VARCHAR(200),
    source_file VARCHAR(255) DEFAULT '05_lgd_subdistricts.csv',
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.members_of_parliament (
    mp_id SERIAL PRIMARY KEY,
    mp_name VARCHAR(255) UNIQUE NOT NULL,
    house VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.constituencies (
    constituency_id SERIAL PRIMARY KEY,
    constituency_name VARCHAR(150) NOT NULL,
    state_code INT REFERENCES public.lgd_states(state_code),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_constituency_state UNIQUE (constituency_name, state_code)
);

CREATE TABLE IF NOT EXISTS public.implementing_agencies (
    ida_id SERIAL PRIMARY KEY,
    ida_name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CORE SCHEMA WORKS / PROJECTS TABLES (public)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.works_all (
    source_row_id INT PRIMARY KEY,
    source_file VARCHAR(255) DEFAULT 'mplads_all_works.csv' NOT NULL,
    mp_name VARCHAR(255) NOT NULL,
    work_title TEXT NOT NULL,
    category VARCHAR(100),
    state_name VARCHAR(100) NOT NULL,
    constituency_name VARCHAR(150) NOT NULL,
    ida_name VARCHAR(255) NOT NULL,
    city VARCHAR(150),
    ward VARCHAR(150),
    block VARCHAR(150),
    village VARCHAR(150),
    recommended_date DATE,
    allocation_amount NUMERIC(15, 2) CHECK (allocation_amount >= 0),
    ida_approval_status VARCHAR(100),
    work_status VARCHAR(100),
    house VARCHAR(50),
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.works_completed (
    work_id BIGINT PRIMARY KEY,
    source_file VARCHAR(255) DEFAULT 'mplads_completed_works.csv' NOT NULL,
    source_row_id INT NOT NULL,
    work_description TEXT,
    category VARCHAR(100),
    mp_name VARCHAR(255) NOT NULL,
    constituency_name VARCHAR(150) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    house VARCHAR(50),
    final_amount NUMERIC(15, 2) NOT NULL CHECK (final_amount >= 0),
    completed_date DATE,
    has_images BOOLEAN DEFAULT FALSE,
    average_rating NUMERIC(3, 2),
    ida_name VARCHAR(255) NOT NULL,
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 4. FINANCIALS DOMAIN (Polymorphic FK Constraint)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.work_financials (
    financial_id BIGSERIAL PRIMARY KEY,
    work_type VARCHAR(20) NOT NULL CHECK (work_type IN ('RECOMMENDED', 'COMPLETED')),
    source_row_id INT REFERENCES public.works_all(source_row_id),
    work_id BIGINT REFERENCES public.works_completed(work_id),
    allocated_amount NUMERIC(15, 2) CHECK (allocated_amount >= 0),
    final_amount NUMERIC(15, 2) CHECK (final_amount >= 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    source_file VARCHAR(255) NOT NULL,
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_work_financials_target CHECK (
        (work_type = 'RECOMMENDED' AND source_row_id IS NOT NULL AND work_id IS NULL) OR
        (work_type = 'COMPLETED'   AND work_id IS NOT NULL AND source_row_id IS NULL)
    )
);

-- ============================================================================
-- 5. FUTURE FOUNDATION DOMAINS (EMPTY - Designed for future ingest)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.work_progress (
    progress_id BIGSERIAL PRIMARY KEY,
    work_type VARCHAR(20) NOT NULL CHECK (work_type IN ('RECOMMENDED', 'COMPLETED')),
    source_row_id INT REFERENCES public.works_all(source_row_id),
    work_id BIGINT REFERENCES public.works_completed(work_id),
    status_name VARCHAR(100),
    status_date DATE,
    completion_percentage NUMERIC(5, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.contractors (
    contractor_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(20),
    pan VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.procurement_tenders (
    tender_id VARCHAR(100) PRIMARY KEY,
    work_id BIGINT REFERENCES public.works_completed(work_id),
    source_row_id INT REFERENCES public.works_all(source_row_id),
    tender_title TEXT NOT NULL,
    published_date DATE,
    estimated_value NUMERIC(15, 2),
    status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS public.contracts (
    contract_id VARCHAR(100) PRIMARY KEY,
    tender_id VARCHAR(100) REFERENCES public.procurement_tenders(tender_id),
    contractor_id INT REFERENCES public.contractors(contractor_id),
    awarded_amount NUMERIC(15, 2) NOT NULL,
    award_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    payment_id VARCHAR(100) PRIMARY KEY,
    contract_id VARCHAR(100) REFERENCES public.contracts(contract_id),
    amount NUMERIC(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS public.work_documents (
    document_id BIGSERIAL PRIMARY KEY,
    work_id BIGINT REFERENCES public.works_completed(work_id),
    source_row_id INT REFERENCES public.works_all(source_row_id),
    document_type VARCHAR(50) NOT NULL,
    file_uri TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. RISK INTELLIGENCE & INVESTIGATION DOMAINS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.risk_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detector_version VARCHAR(50) NOT NULL,
    feature_version VARCHAR(50) NOT NULL,
    source_data_version VARCHAR(100) NOT NULL,
    processed_count INT NOT NULL,
    high_risk_count INT NOT NULL,
    critical_risk_count INT NOT NULL,
    duration_seconds NUMERIC(8, 2) NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.risk_anomaly_results (
    anomaly_id BIGSERIAL PRIMARY KEY,
    run_id UUID REFERENCES public.risk_runs(run_id) ON DELETE CASCADE,
    work_type VARCHAR(20) NOT NULL CHECK (work_type IN ('RECOMMENDED', 'COMPLETED')),
    source_row_id INT REFERENCES public.works_all(source_row_id),
    work_id BIGINT REFERENCES public.works_completed(work_id),
    risk_score NUMERIC(5, 2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    risk_category VARCHAR(100) NOT NULL,
    reason_codes JSONB NOT NULL,
    evidence_json JSONB NOT NULL,
    feature_values_json JSONB NOT NULL,
    peer_stats_json JSONB NOT NULL,
    detector_version VARCHAR(50) DEFAULT 'v1.0.0' NOT NULL,
    feature_version VARCHAR(50) DEFAULT 'v1.0.0' NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_risk_target CHECK (
        (work_type = 'RECOMMENDED' AND source_row_id IS NOT NULL AND work_id IS NULL) OR
        (work_type = 'COMPLETED'   AND work_id IS NOT NULL AND source_row_id IS NULL)
    ),
    CONSTRAINT uq_risk_run_recommended UNIQUE (run_id, source_row_id),
    CONSTRAINT uq_risk_run_completed UNIQUE (run_id, work_id)
);

CREATE TABLE IF NOT EXISTS public.investigation_cases (
    case_id BIGSERIAL PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    work_type VARCHAR(20) NOT NULL CHECK (work_type IN ('RECOMMENDED', 'COMPLETED')),
    source_row_id INT REFERENCES public.works_all(source_row_id),
    work_id BIGINT REFERENCES public.works_completed(work_id),
    risk_score NUMERIC(5, 2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'VERIFIED', 'DISMISSED', 'ESCALATED')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    assigned_to VARCHAR(255),
    signals_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.investigation_notes (
    note_id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES public.investigation_cases(case_id) ON DELETE CASCADE,
    author VARCHAR(255) NOT NULL,
    note_text TEXT NOT NULL,
    action_taken VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. INDEXES FOR ANALYTICAL FILTERING, RISK SEARCH & TRIGRAM NLP
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_works_all_state ON public.works_all(state_name);
CREATE INDEX IF NOT EXISTS idx_works_all_constituency ON public.works_all(constituency_name);
CREATE INDEX IF NOT EXISTS idx_works_all_mp ON public.works_all(mp_name);
CREATE INDEX IF NOT EXISTS idx_works_all_status ON public.works_all(work_status);
CREATE INDEX IF NOT EXISTS idx_works_all_recommended_date ON public.works_all(recommended_date);

CREATE INDEX IF NOT EXISTS idx_works_completed_state ON public.works_completed(state_name);
CREATE INDEX IF NOT EXISTS idx_works_completed_mp ON public.works_completed(mp_name);
CREATE INDEX IF NOT EXISTS idx_works_completed_date ON public.works_completed(completed_date);

CREATE INDEX IF NOT EXISTS idx_works_all_drilldown ON public.works_all(state_name, constituency_name, work_status);
CREATE INDEX IF NOT EXISTS idx_works_completed_analytics ON public.works_completed(state_name, category, final_amount);

CREATE INDEX IF NOT EXISTS idx_works_all_title_trgm ON public.works_all USING gin (work_title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_risk_results_level ON public.risk_anomaly_results(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_results_score ON public.risk_anomaly_results(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_risk_results_run ON public.risk_anomaly_results(run_id);
CREATE INDEX IF NOT EXISTS idx_investigation_status ON public.investigation_cases(status);
