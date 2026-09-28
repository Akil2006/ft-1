from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class EvidenceResponse(BaseModel):
    id: str
    inspection_id: str
    image_id: Optional[str] = None
    field_id: Optional[str] = None
    field_name: Optional[str] = None
    source_text: Optional[str] = None
    confidence: float
    bbox_x: Optional[float] = None
    bbox_y: Optional[float] = None
    bbox_width: Optional[float] = None
    bbox_height: Optional[float] = None
    crop_path: Optional[str] = None
    crop_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InspectionEvidenceResultSchema(BaseModel):
    inspection_id: str
    total_evidence_items: int
    evidence: List[EvidenceResponse]
