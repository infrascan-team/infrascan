from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.v1.auth import router as auth_router
from app.api.v1.assets import router as assets_router
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
if os.path.exists(settings.UPLOAD_DIR):
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
