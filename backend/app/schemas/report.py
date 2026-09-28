from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ReportResponseSchema(BaseModel):
    inspection_id: str
    report_filename: str
    report_url: str
    generated_at: datetime
