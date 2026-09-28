from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.inspection import Inspection
from app.models.compliance_check import ComplianceCheck
from app.schemas.compliance import InspectionComplianceResultSchema, ComplianceCheckResponse
from app.security.auth import get_current_user
from app.services.compliance_service import compliance_service

router = APIRouter(prefix="/inspections", tags=["Inspection Results & Compliance"])

@router.post("/{inspection_id}/compliance", response_model=InspectionComplianceResultSchema)
def trigger_compliance_checks(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Executes deterministic rule engine checks on an inspection session."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    checks = compliance_service.process_inspection_compliance(db, inspection_id)
    db.refresh(inspection)

    compliant_cnt = sum(1 for c in checks if c.result == "COMPLIANT")
    review_cnt = sum(1 for c in checks if c.result == "REVIEW_REQUIRED")
    missing_cnt = sum(1 for c in checks if c.result == "MISSING_INFORMATION")
    na_cnt = sum(1 for c in checks if c.result == "NOT_APPLICABLE")

    missing_fields_list = [c.field_name for c in checks if c.applicable and c.result in ("MISSING_INFORMATION", "REVIEW_REQUIRED")]

    return InspectionComplianceResultSchema(
        inspection_id=inspection_id,
        overall_result=inspection.overall_result or "REVIEW_REQUIRED",
        total_rules_checked=len(checks),
        compliant_count=compliant_cnt,
        review_required_count=review_cnt,
        missing_info_count=missing_cnt,
        not_applicable_count=na_cnt,
        completeness_score=inspection.completeness_score,
        expected_fields_count=inspection.expected_fields_count,
        detected_fields_count=inspection.detected_fields_count,
        missing_fields=missing_fields_list,
        integrity_hash=inspection.integrity_hash,
        hash_algorithm=inspection.hash_algorithm or "SHA-256",
        checks=[ComplianceCheckResponse.model_validate(c) for c in checks]
    )

@router.get("/{inspection_id}/results", response_model=InspectionComplianceResultSchema)
def get_compliance_results(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves stored compliance check results and rule trace for an inspection session."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    checks = db.query(ComplianceCheck).filter(ComplianceCheck.inspection_id == inspection_id).all()
    if not checks:
        checks = compliance_service.process_inspection_compliance(db, inspection_id)
        db.refresh(inspection)

    compliant_cnt = sum(1 for c in checks if c.result == "COMPLIANT")
    review_cnt = sum(1 for c in checks if c.result == "REVIEW_REQUIRED")
    missing_cnt = sum(1 for c in checks if c.result == "MISSING_INFORMATION")
    na_cnt = sum(1 for c in checks if c.result == "NOT_APPLICABLE")

    missing_fields_list = [c.field_name for c in checks if c.applicable and c.result in ("MISSING_INFORMATION", "REVIEW_REQUIRED")]

    return InspectionComplianceResultSchema(
        inspection_id=inspection_id,
        overall_result=inspection.overall_result or "REVIEW_REQUIRED",
        total_rules_checked=len(checks),
        compliant_count=compliant_cnt,
        review_required_count=review_cnt,
        missing_info_count=missing_cnt,
        not_applicable_count=na_cnt,
        completeness_score=inspection.completeness_score,
        expected_fields_count=inspection.expected_fields_count,
        detected_fields_count=inspection.detected_fields_count,
        missing_fields=missing_fields_list,
        integrity_hash=inspection.integrity_hash,
        hash_algorithm=inspection.hash_algorithm or "SHA-256",
        checks=[ComplianceCheckResponse.model_validate(c) for c in checks]
    )
