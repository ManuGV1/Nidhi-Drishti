# NIDHIDRISHTI Database Architecture & Data Loading Documentation (Stage 2)

This document provides the technical reference for the PostgreSQL 18+ database architecture, entity-relationship model, data loading pipeline, and validation framework for Stage 2 of the **NIDHIDRISHTI** platform.

---

## 1. Executive Architecture Summary

The database layer serves as the single source of truth for all MPLADS works, location intelligence, parliamentary governance metrics, and future analytical domains (procurement, contracts, contractors, payments, physical telemetry, risk scoring).

- **Engine**: PostgreSQL 18.4 (Port 5432)
- **Database Name**: `nidhidrishti`
- **Schemas**:
  - `stg`: Raw CSV staging tables for idempotent ingestion.
  - `public`: Production core domain tables, constraints, foreign keys, and indexes.
- **ORM Integration**: Prisma ORM (`database/schema.prisma`) for TypeScript/Node.js API integration.

---

## 2. Core Logical Domains & Tables

### Domain 1: Geography Intelligence (LGD Master Data)
- `lgd_states` (36 States/UTs, `state_code` PK)
- `lgd_districts` (785 Districts, `district_code` PK, FK to `lgd_states`)
- `lgd_subdistricts` (7,151 Subdistricts, `subdistrict_code` PK, FKs to `lgd_districts` and `lgd_states`)

### Domain 2: Parliamentary Governance
- `members_of_parliament` (MP master table, deterministic matching only)
- `constituencies` (Constituency master table, deterministic matching only)

### Domain 3: Agencies
- `implementing_agencies` (Implementing District Authorities master table)

### Domain 4: Projects / Works (Primary Datasets)
- `works_all` (60,359 rows from `mplads_all_works.csv`, `source_row_id` PK 1..60359, 100% source-preserved)
- `works_completed` (44,028 rows from `mplads_completed_works.csv`, real `work_id` PK)

### Domain 5: Financials (Polymorphic Table)
- `work_financials` (Financial tracking with strict check constraint `chk_work_financials_target` enforcing `work_type = 'RECOMMENDED'` -> `source_row_id` and `work_type = 'COMPLETED'` -> `work_id`).

### Domains 6–12: Future Foundation Tables (EMPTY)
- `work_progress`: Physical progress telemetry foundation (EMPTY).
- `procurement_tenders`: Tender foundation (EMPTY).
- `contracts`: Contract foundation (EMPTY).
- `contractors`: Vendor foundation (EMPTY).
- `payment_transactions`: Disbursement transaction foundation (EMPTY).
- `work_documents`: Image and document proof foundation (EMPTY).
- `risk_anomaly_results`: ML risk scoring output foundation (EMPTY).

---

## 3. Provenance Strategy & Rules

1. **Source Tracking (Works datasets)**: Every row in `works_all` and `works_completed` tracks `source_file` + `source_row_id` + `ingested_at`. The `source_row_id` (1..N) provides stable lineage back to the originating CSV row.
2. **LGD Master Data**: LGD master tables (`lgd_states`, `lgd_districts`, `lgd_subdistricts`) track `source_file` + `ingested_at` only. These datasets use authoritative natural primary keys (`state_code`, `district_code`, `subdistrict_code`) that are themselves stable identifiers; a separate `source_row_id` is not required or assigned.
3. **No Synthetic Identifiers**: No fake Work IDs are generated for `works_all`. `source_row_id` provides stable lineage back to `mplads_all_works.csv`.
4. **ETL Re-run Safety**: Schema DDL uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` throughout. Destructive schema recreation (`DROP SCHEMA CASCADE`) is never executed automatically — only on explicit request. Re-runs use a controlled `TRUNCATE` of all tables in FK-safe order.
5. **Database Creation Separation**: The `nidhidrishti` database is created via a standalone `autocommit` connection to `postgres` (Step 1). All schema application, staging, core loads, and work_financials population occur inside a single transactional connection to `nidhidrishti` (Step 2), ensuring a clean rollback on any failure.

---

## 4. Automated Validation Checklist (V01 – V14)

Execution of `python D:\NidhiDristi\scripts\validate_database.py` validates all 14 tests:

- **V01**: `works_all` Row Count = 60,359
- **V02**: `works_completed` Row Count = 44,028
- **V03**: `lgd_states` Row Count = 36
- **V04**: `lgd_districts` Row Count = 785
- **V05**: `lgd_subdistricts` Row Count = 7,151
- **V06**: `works_all` Allocation Financial Total
- **V07**: `works_completed` Final Amount Total
- **V08**: `source_row_id` Uniqueness in `works_all`
- **V09**: Real `Work ID` Uniqueness in `works_completed`
- **V10**: Polymorphic Financial Constraint Integrity (0 violations)
- **V11**: Critical-Field Non-Null Check
- **V12**: Recommended Date Range Validation
- **V13**: Non-Negative Amount Validation
- **V14**: Provenance Completeness Check
