import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.auth import router as auth_router
from app.api.v1.assets import router as assets_router
from app.api.v1.inspections import router as inspections_router
from app.api.v1.maintenance import router as maintenance_router
from app.api.v1.models import router as models_router
from app.api.v1.reports import router as reports_router
from app.db.session import SessionLocal
from app.db.init_db import init_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for InfraScan — AI-Powered Crack & Damage Assessment for Civil Infrastructure",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Startup database initialization
@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()

# Include API Routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication & Personnel"])
app.include_router(assets_router, prefix=f"{settings.API_V1_STR}/assets", tags=["Infrastructure Assets"])
app.include_router(inspections_router, prefix=f"{settings.API_V1_STR}/inspections", tags=["Inspections & AI Inference"])
app.include_router(maintenance_router, prefix=f"{settings.API_V1_STR}/work-orders", tags=["Maintenance Work Orders"])
app.include_router(models_router, prefix=f"{settings.API_V1_STR}/models", tags=["AI Model Benchmarks & Governance"])
app.include_router(reports_router, prefix=f"{settings.API_V1_STR}/reports", tags=["Inspection Audit Reports"])

@app.get("/")
def root():
    return {
        "platform": "InfraScan Enterprise Civil Infrastructure Assessment",
        "status": "online",
        "docs_url": "/docs",
        "version": settings.VERSION,
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
