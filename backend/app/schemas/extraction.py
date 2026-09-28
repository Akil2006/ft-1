from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class ExtractedFieldResponse(BaseModel):
    id: str
    inspection_id: str
    field_name: str
    raw_value: Optional[str] = None
    normalized_value: Optional[str] = None
    confidence: float
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ExtractionResultSchema(BaseModel):
    inspection_id: str
    total_fields_extracted: int
    fields: List[ExtractedFieldResponse]
