import os
from pathlib import Path
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_DEFAULT_DB = (_BACKEND_DIR / "infrascan.db").as_posix()
_DEFAULT_UPLOADS = (_BACKEND_DIR / "uploads").as_posix()

class Settings(BaseSettings):
    PROJECT_NAME: str = "InfraScan API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # JWT & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "infrascan_super_secret_jwt_key_civil_infrastructure_2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB}")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Uploads & Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", _DEFAULT_UPLOADS)

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
