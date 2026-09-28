from typing import List, Optional
from pydantic import BaseModel, Field

class OCRItemSchema(BaseModel):
    text: str = Field(..., description="Recognized text snippet")
    confidence: float = Field(..., ge=0.0, le=1.0, description="OCR confidence score between 0.0 and 1.0")
    bbox: List[float] = Field(..., min_length=4, max_length=4, description="Bounding box [x1, y1, x2, y2]")
    image_id: str = Field(..., description="Associated InspectionImage ID")
    engine: str = Field(..., description="Name of the OCR engine that produced this result")

class OCRResultSchema(BaseModel):
    inspection_id: str
    total_text_blocks: int
    engine_used: str
    items: List[OCRItemSchema]
