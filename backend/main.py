import sys
import os

# Ensure project root directory is in sys.path when running main.py directly
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import APP_NAME, APP_VERSION
from backend.routers import overview, geography, works, risks, analytics, live_analysis, investigations

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Production-Quality Intelligence Platform Core for NIDHIDRISHTI (MPLADS Transparency & Risk Engine)"
)

# CORS Configuration for UI frontend integration (supporting Render & Vercel production deployment & local development)
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
env_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

default_origins = [
    "https://nidhi-drishti.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

allowed_origins = list(dict.fromkeys(default_origins + env_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
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
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload_mode = os.getenv("RELOAD", "false").lower() == "true"

    if reload_mode:
        uvicorn.run("backend.main:app", host=host, port=port, reload=True)
    else:
        uvicorn.run(app, host=host, port=port)

