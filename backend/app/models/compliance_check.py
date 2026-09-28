import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from app.database import Base

class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspection_id = Column(String(36), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id = Column(String(100), nullable=False, index=True)
    rule_version = Column(String(50), nullable=False)
    field_name = Column(String(100), nullable=False)
    
    applicable = Column(Boolean, default=True, nullable=False)
    # Result: COMPLIANT, REVIEW_REQUIRED, MISSING_INFORMATION, NOT_APPLICABLE
    result = Column(String(50), nullable=False)
    severity = Column(String(50), default="HIGH", nullable=False)
    
    detected_value = Column(String(512), nullable=True)
    reason = Column(String(1024), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    inspection = relationship("Inspection", back_populates="compliance_checks")
