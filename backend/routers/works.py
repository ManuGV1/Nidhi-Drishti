"""
NIDHIDRISHTI — Works Router
GET /api/works, GET /api/works/{id}
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import math
from backend.db import get_db_cursor
from backend.schemas import PaginatedResponse, WorkDetail

router = APIRouter(prefix="/api/works", tags=["Works"])

@router.get("", response_model=PaginatedResponse)
def get_works(
    work_type: str = Query("RECOMMENDED", pattern="^(RECOMMENDED|COMPLETED|NIRIKSHAN_RECOMMENDED|NIRIKSHAN_COMPLETED)$"),
    state: Optional[str] = None,
    constituency: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    offset = (page - 1) * limit
    params = []

    if work_type == "RECOMMENDED":
        table = "public.works_all"
        id_col = "source_row_id"
        title_col = "work_title"
        amount_col = "allocation_amount"
        date_col = "recommended_date"
        state_col = "state_name"
        constituency_col = "constituency_name"
        category_col = "category"
    elif work_type == "COMPLETED":
        table = "public.works_completed"
        id_col = "work_id"
        title_col = "work_description"
        amount_col = "final_amount"
        date_col = "completed_date"
        state_col = "state_name"
        constituency_col = "constituency_name"
        category_col = "category"
    elif work_type == "NIRIKSHAN_RECOMMENDED":
        table = "public.nirikshan_recommended"
        id_col = "nirikshan_id"
        title_col = "work_description"
        amount_col = "recommended_amount"
        date_col = "recommendation_date"
        state_col = "state_name"
        constituency_col = "constituency"
        category_col = "work_category"
    else:
        table = "public.nirikshan_completed"
        id_col = "nirikshan_id"
        title_col = "work_description"
        amount_col = "actual_amount"
        date_col = "actual_end_date"
        state_col = "state_name"
        constituency_col = "constituency"
        category_col = "work_category"

    where_clauses = []
    if state:
        where_clauses.append(f"UPPER({state_col}) = UPPER(%s)")
        params.append(state)
    if constituency:
        where_clauses.append(f"UPPER({constituency_col}) = UPPER(%s)")
        params.append(constituency)
    if category:
        where_clauses.append(f"UPPER({category_col}) = UPPER(%s)")
        params.append(category)
    if search:
        s = f"%{search}%"
        or_conds = [
            f"{title_col} ILIKE %s",
            f"{constituency_col} ILIKE %s",
            "COALESCE(ida_name, '') ILIKE %s",
            "COALESCE(mp_name, '') ILIKE %s"
        ]
        if table in ("public.works_all", "public.works_completed"):
            or_conds.extend([
                "COALESCE(city, '') ILIKE %s",
                "COALESCE(block, '') ILIKE %s",
                "COALESCE(village, '') ILIKE %s"
            ])
        where_clauses.append("(" + " OR ".join(or_conds) + ")")
        params.extend([s] * len(or_conds))

    where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    with get_db_cursor() as cur:
        count_query = f"SELECT COUNT(*) AS count FROM {table}{where_sql};"
        cur.execute(count_query, params)
        total_records = cur.fetchone()["count"]

        source_file_expr = "'nirikshan_real'" if "NIRIKSHAN" in work_type else "source_file"

        data_query = f"""
            SELECT '{work_type}' as work_type, {id_col} as id, COALESCE({title_col}, 'UNSPECIFIED') as work_title,
                   {category_col} as category, {state_name_col if 'state_name_col' in locals() else state_col} as state_name,
                   {constituency_col} as constituency_name, ida_name, mp_name,
                   {amount_col} as amount, {date_col} as date_field, {source_file_expr} as source_file
            FROM {table}
            {where_sql}
            ORDER BY {id_col} ASC
            LIMIT %s OFFSET %s;
        """
        cur.execute(data_query, params + [limit, offset])
        rows = cur.fetchall()

    items = []
    for r in rows:
        items.append({
            "work_type": r["work_type"],
            "id": r["id"],
            "work_title": r["work_title"],
            "category": r["category"],
            "state_name": r["state_name"],
            "constituency_name": r["constituency_name"],
            "ida_name": r["ida_name"] or "UNSPECIFIED",
            "mp_name": r["mp_name"] or "UNSPECIFIED",
            "amount": float(r["amount"]) if r["amount"] else 0.0,
            "recommended_date": r["date_field"] if "RECOMMENDED" in work_type else None,
            "completed_date": r["date_field"] if "COMPLETED" in work_type else None,
            "source_file": r["source_file"]
        })

    total_pages = math.ceil(total_records / limit) if total_records > 0 else 1

    return PaginatedResponse(
        total_records=total_records,
        page=page,
        limit=limit,
        total_pages=total_pages,
        data=items
    )

@router.get("/{id}", response_model=WorkDetail)
def get_work_by_id(id: int, work_type: str = Query("RECOMMENDED", pattern="^(RECOMMENDED|COMPLETED|NIRIKSHAN_RECOMMENDED|NIRIKSHAN_COMPLETED)$")):
    with get_db_cursor() as cur:
        if work_type == "RECOMMENDED":
            cur.execute("""
                SELECT 'RECOMMENDED' as work_type, source_row_id as id, work_title, category,
                       state_name, constituency_name, ida_name, mp_name, allocation_amount as amount,
                       work_status as status, recommended_date, source_file
                FROM public.works_all
                WHERE source_row_id = %s;
            """, (id,))
        elif work_type == "COMPLETED":
            cur.execute("""
                SELECT 'COMPLETED' as work_type, work_id as id, work_description as work_title, category,
                       state_name, constituency_name, ida_name, mp_name, final_amount as amount,
                       'COMPLETED' as status, completed_date, source_file
                FROM public.works_completed
                WHERE work_id = %s;
            """, (id,))
        elif work_type == "NIRIKSHAN_RECOMMENDED":
            cur.execute("""
                SELECT 'NIRIKSHAN_RECOMMENDED' as work_type, nirikshan_id as id,
                       COALESCE(work_description, activity_name) as work_title, work_category as category,
                       state_name, constituency as constituency_name, ida_name, mp_name, recommended_amount as amount,
                       work_stage as status, recommendation_date as recommended_date, 'nirikshan_real' as source_file
                FROM public.nirikshan_recommended
                WHERE nirikshan_id = %s;
            """, (id,))
        else:
            cur.execute("""
                SELECT 'NIRIKSHAN_COMPLETED' as work_type, nirikshan_id as id,
                       COALESCE(work_description, activity_name) as work_title, work_category as category,
                       state_name, constituency as constituency_name, ida_name, mp_name, actual_amount as amount,
                       'COMPLETED' as status, actual_end_date as completed_date, 'nirikshan_real' as source_file
                FROM public.nirikshan_completed
                WHERE nirikshan_id = %s;
            """, (id,))

        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Work not found.")

    return WorkDetail(
        work_type=row["work_type"],
        id=row["id"],
        work_title=row["work_title"] or "UNSPECIFIED",
        category=row.get("category"),
        state_name=row["state_name"] or "UNSPECIFIED",
        constituency_name=row["constituency_name"] or "UNSPECIFIED",
        ida_name=row.get("ida_name") or "UNSPECIFIED",
        mp_name=row.get("mp_name") or "UNSPECIFIED",
        amount=float(row["amount"]) if row["amount"] else 0.0,
        status=row.get("status"),
        recommended_date=row.get("recommended_date"),
        completed_date=row.get("completed_date"),
        source_file=row["source_file"]
    )
