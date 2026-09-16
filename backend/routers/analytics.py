"""
NIDHIDRISHTI — Analytics Router
GET /api/analytics/financial-distribution, GET /api/analytics/category-breakdown
"""

from fastapi import APIRouter
from typing import List, Dict, Any
from backend.db import get_db_cursor

router = APIRouter(prefix="/api/analytics", tags=["Analytics Lab"])

@router.get("/financial-distribution", response_model=List[Dict[str, Any]])
def get_financial_distribution():
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT 
                CASE 
                    WHEN allocation_amount < 100000 THEN '< ₹1 Lakh'
                    WHEN allocation_amount < 500000 THEN '₹1L - ₹5L'
                    WHEN allocation_amount < 1000000 THEN '₹5L - ₹10L'
                    WHEN allocation_amount < 2500000 THEN '₹10L - ₹25L'
                    WHEN allocation_amount < 5000000 THEN '₹25L - ₹50L'
                    ELSE '> ₹50 Lakh'
                END AS bracket,
                COUNT(*) AS work_count,
                SUM(allocation_amount) AS total_amount
            FROM public.works_all
            GROUP BY bracket
            ORDER BY MIN(allocation_amount) ASC;
        """)
        return cur.fetchall()

@router.get("/category-breakdown", response_model=List[Dict[str, Any]])
def get_category_breakdown():
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT category, COUNT(*) AS work_count, SUM(allocation_amount) AS total_allocation
            FROM public.works_all
            GROUP BY category
            ORDER BY total_allocation DESC;
        """)
        return cur.fetchall()
