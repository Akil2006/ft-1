import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from app.database import Base

class RegulatoryReference(Base):
    __tablename__ = "regulatory_references"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_id = Column(String(100), nullable=False, index=True)
    rule_version = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    
    source_document = Column(String(255), nullable=False)
    source_section = Column(String(100), nullable=True)
    source_url = Column(String(512), nullable=True)
    
    effective_date = Column(String(50), nullable=True)
    last_verified = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
