import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspection_id = Column(String(36), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False, index=True)
    image_id = Column(String(36), ForeignKey("inspection_images.id", ondelete="CASCADE"), nullable=True, index=True)
    field_id = Column(String(36), ForeignKey("extracted_fields.id", ondelete="CASCADE"), nullable=True, index=True)
    
    source_text = Column(String(512), nullable=True)
    confidence = Column(Float, default=0.0, nullable=False)
    
    # Bounding Box coordinates (numeric)
    bbox_x = Column(Float, nullable=True)
    bbox_y = Column(Float, nullable=True)
    bbox_width = Column(Float, nullable=True)
    bbox_height = Column(Float, nullable=True)
    
    crop_path = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    inspection = relationship("Inspection", back_populates="evidence")
    image = relationship("InspectionImage", back_populates="evidence")
    field = relationship("ExtractedField", back_populates="evidence")
