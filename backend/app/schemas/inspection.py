from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class InspectionCreate(BaseModel):
    product_name: Optional[str] = Field(None, max_length=255, description="Product Name")
    category: Optional[str] = Field(None, max_length=100, description="Product Category e.g. Food, Cosmetics")
    package_type: Optional[str] = Field(None, max_length=100, description="Package Type e.g. Box, Bottle, Pouch")

class InspectionImageResponse(BaseModel):
    id: str
    inspection_id: str
    filename: str
    storage_path: str
    image_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    processing_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InspectionResponse(BaseModel):
    id: str
    user_id: str
    batch_id: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    package_type: Optional[str] = None
    status: str
    overall_result: Optional[str] = None
    completeness_score: Optional[float] = None
    expected_fields_count: Optional[int] = None
    detected_fields_count: Optional[int] = None
    integrity_hash: Optional[str] = None
    hash_algorithm: Optional[str] = None
    hash_generated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    images: List[InspectionImageResponse] = []

    model_config = ConfigDict(from_attributes=True)

class PaginatedInspectionResponse(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: List[InspectionResponse]
