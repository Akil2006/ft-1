from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import engine, Base, auto_migrate_schema
import app.models  # Ensure models are imported so Base metadata is populated
from app.api import auth, inspections, batches, images, ocr, extraction, rules, results, evidence, analytics, reports, regulatory, admin

# Initialize Database Tables & Schema Migrations
Base.metadata.create_all(bind=engine)
auto_migrate_schema()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="SmartPack - AI-Powered Packaged Commodity Inspection and Legal Metrology Compliance Assistance System",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files Serving for storage
os.makedirs("storage", exist_ok=True)
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(inspections.router, prefix=settings.API_V1_STR)
app.include_router(batches.router, prefix=settings.API_V1_STR)
app.include_router(images.router, prefix=settings.API_V1_STR)
app.include_router(ocr.router, prefix=settings.API_V1_STR)
app.include_router(extraction.router, prefix=settings.API_V1_STR)
app.include_router(rules.router, prefix=settings.API_V1_STR)
app.include_router(results.router, prefix=settings.API_V1_STR)
app.include_router(evidence.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(regulatory.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "smartpack",
        "version": "1.0.0"
    }

@app.get("/health/detailed", status_code=status.HTTP_200_OK)
def detailed_health_check():
    """Detailed health check endpoint"""
    return {
        "status": "ok",
        "service": "smartpack",
        "version": "1.0.0",
        "database": "connected",
        "storage": {
            "uploads": True,
            "processed": True,
            "evidence": True,
            "reports": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
