from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class FlaggedFieldStat(BaseModel):
    field_name: str
    flag_count: int
    rule_id: str
    severity: str

class StatusDistributionStat(BaseModel):
    status: str
    count: int

class InspectionTrendStat(BaseModel):
    date: str
    count: int

class AnalyticsResponseSchema(BaseModel):
    total_inspections: int
    compliant_count: int
    review_required_count: int
    missing_info_count: int
    not_applicable_count: int
    compliance_rate: float
    frequently_flagged_fields: List[FlaggedFieldStat]
    status_distribution: List[StatusDistributionStat]
    inspection_trend: List[InspectionTrendStat]
