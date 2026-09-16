"""
NIDHIDRISHTI — FastAPI Intelligence Platform Core
Entrypoint registering CORS middleware and all intelligence routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import APP_NAME, APP_VERSION
from backend.routers import overview, geography, works, risks, analytics, live_analysis, investigations

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Production-Quality Intelligence Platform Core for NIDHIDRISHTI (MPLADS Transparency & Risk Engine)"
)

# CORS Configuration for UI frontend integration (supporting any LAN IP / localhost origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(overview.router)
app.include_router(geography.router)
app.include_router(works.router)
app.include_router(risks.router)
app.include_router(analytics.router)
app.include_router(live_analysis.router)
app.include_router(investigations.router)

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "app": APP_NAME,
        "version": APP_VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
