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
    product_name: Optional[str] = None
    category: Optional[str] = None
    package_type: Optional[str] = None
    status: str
    overall_result: Optional[str] = None
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
