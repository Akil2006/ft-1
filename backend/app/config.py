import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartPack"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "smartpack_secret_key_hackathon_2026_super_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    DATABASE_URL: str = "sqlite:///./smartpack.db"

    UPLOAD_DIR: str = "./storage/uploads"
    PROCESSED_DIR: str = "./storage/processed"
    EVIDENCE_DIR: str = "./storage/evidence"
    REPORT_DIR: str = "./storage/reports"

    OCR_ENGINE: str = "paddle"
    OCR_FALLBACK_ENABLED: bool = True

    MAX_UPLOAD_SIZE_MB: int = 10
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# Ensure directories exist
for folder in [settings.UPLOAD_DIR, settings.PROCESSED_DIR, settings.EVIDENCE_DIR, settings.REPORT_DIR]:
    os.makedirs(folder, exist_ok=True)
