import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class InspectionImage(Base):
    __tablename__ = "inspection_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspection_id = Column(String(36), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    storage_path = Column(String(512), nullable=False)
    
    # FRONT, BACK, SIDE, TOP, BOTTOM, OTHER
    image_type = Column(String(50), default="FRONT", nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    processing_status = Column(String(50), default="PENDING", nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    inspection = relationship("Inspection", back_populates="images")
    evidence = relationship("Evidence", back_populates="image", cascade="all, delete-orphan")
