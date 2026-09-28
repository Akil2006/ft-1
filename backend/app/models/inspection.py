import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_name = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    package_type = Column(String(100), nullable=True)
    
    # Status: UPLOADED, PREPROCESSING, OCR_PROCESSING, EXTRACTING, RULE_EVALUATION, COMPLETED, FAILED
    status = Column(String(50), default="UPLOADED", nullable=False)
    
    # Overall Result: COMPLIANT, REVIEW_REQUIRED, MISSING_INFORMATION, NOT_APPLICABLE
    overall_result = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="inspections")
    images = relationship("InspectionImage", back_populates="inspection", cascade="all, delete-orphan")
    extracted_fields = relationship("ExtractedField", back_populates="inspection", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="inspection", cascade="all, delete-orphan")
    compliance_checks = relationship("ComplianceCheck", back_populates="inspection", cascade="all, delete-orphan")
