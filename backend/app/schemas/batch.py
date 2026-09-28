from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.inspection import InspectionResponse

class BatchCreate(BaseModel):
    name: Optional[str] = Field("Batch Inspection", max_length=255)

class BatchResponse(BaseModel):
    id: str
    user_id: str
    name: str
    status: str
    total_count: int
    completed_count: int
    failed_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BatchDetailResponse(BatchResponse):
    inspections: List[InspectionResponse] = []

    model_config = ConfigDict(from_attributes=True)
