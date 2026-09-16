"""
NIDHIDRISHTI — Geography Router
GET /api/states, GET /api/states/{state_code}, GET /api/constituencies
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.db import get_db_cursor

router = APIRouter(prefix="/api", tags=["Geography"])

@router.get("/states", response_model=List[Dict[str, Any]])
def get_all_states():
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT s.state_code, s.state_name_english AS state_name,
                   COUNT(DISTINCT d.district_code) AS district_count
            FROM public.lgd_states s
            LEFT JOIN public.lgd_districts d ON d.state_code = s.state_code
            GROUP BY s.state_code, s.state_name_english
            ORDER BY s.state_name_english ASC;
        """)
        return cur.fetchall()

@router.get("/states/{state_code}", response_model=Dict[str, Any])
def get_state_detail(state_code: int):
    with get_db_cursor() as cur:
        cur.execute("SELECT state_code, state_name_english AS state_name FROM public.lgd_states WHERE state_code = %s;", (state_code,))
        state_row = cur.fetchone()
        if not state_row:
            raise HTTPException(status_code=404, detail="State not found.")

        cur.execute("SELECT district_code, district_name_english AS district_name FROM public.lgd_districts WHERE state_code = %s ORDER BY district_name_english ASC;", (state_code,))
        districts_rows = cur.fetchall()

        cur.execute("""
            SELECT COUNT(*) AS recommended_count, COALESCE(SUM(allocation_amount), 0) AS total_allocation
            FROM public.works_all w
            JOIN public.lgd_states s ON UPPER(w.state_name) = UPPER(s.state_name_english)
            WHERE s.state_code = %s;
        """, (state_code,))
        works_summary = cur.fetchone()

        res = dict(state_row)
        res["districts"] = [dict(d) for d in districts_rows]
        res["recommended_works_count"] = int(works_summary["recommended_count"])
        res["total_allocation_inr"] = float(works_summary["total_allocation"])
        return res

@router.get("/constituencies", response_model=List[Dict[str, Any]])
def get_constituencies(state_name: str = None, limit: int = 100):
    with get_db_cursor() as cur:
        if state_name:
            cur.execute("""
                SELECT constituency_name, state_name, COUNT(*) as works_count, COALESCE(SUM(allocation_amount), 0) as total_amount
                FROM public.works_all
                WHERE UPPER(state_name) = UPPER(%s)
                GROUP BY constituency_name, state_name
                ORDER BY total_amount DESC
                LIMIT %s;
            """, (state_name, limit))
        else:
            cur.execute("""
                SELECT constituency_name, state_name, COUNT(*) as works_count, COALESCE(SUM(allocation_amount), 0) as total_amount
                FROM public.works_all
                GROUP BY constituency_name, state_name
                ORDER BY total_amount DESC
                LIMIT %s;
            """, (limit,))
        rows = cur.fetchall()
        return [{"constituency_name": r["constituency_name"], "state_name": r["state_name"], "works_count": int(r["works_count"]), "total_amount": float(r["total_amount"] or 0)} for r in rows]
