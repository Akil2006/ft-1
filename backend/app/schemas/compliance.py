from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class RuleApplicabilitySchema(BaseModel):
    package_type: str
    categories: List[str]

class RuleSchema(BaseModel):
    rule_id: str
    rule_version: str
    rule_title: str
    field: str
    applicability: Dict[str, Any]
    requirement: str
    validation_method: str
    severity: str
    source_document: str
    source_section: Optional[str] = None
    effective_date: Optional[str] = None
    exceptions: List[str] = []
    notes: Optional[str] = None

class ComplianceCheckResponse(BaseModel):
    id: str
    inspection_id: str
    rule_id: str
    rule_version: str
    field_name: str
    applicable: bool
    result: str
    severity: str
    detected_value: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InspectionComplianceResultSchema(BaseModel):
    inspection_id: str
    overall_result: str
    total_rules_checked: int
    compliant_count: int
    review_required_count: int
    missing_info_count: int
    not_applicable_count: int
    completeness_score: Optional[float] = None
    expected_fields_count: Optional[int] = None
    detected_fields_count: Optional[int] = None
    missing_fields: List[str] = []
    integrity_hash: Optional[str] = None
    hash_algorithm: Optional[str] = None
    checks: List[ComplianceCheckResponse]
