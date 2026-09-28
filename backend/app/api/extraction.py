from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.inspection import Inspection
from app.models.extracted_field import ExtractedField
from app.schemas.extraction import ExtractionResultSchema, ExtractedFieldResponse
from app.security.auth import get_current_user
from app.services.extraction_service import extraction_service

router = APIRouter(prefix="/inspections", tags=["Field Extraction"])

@router.post("/{inspection_id}/extract", response_model=ExtractionResultSchema)
def trigger_field_extraction(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Executes deterministic pattern-matching field extraction on package OCR text."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    fields = extraction_service.process_inspection_extraction(db, inspection_id)
    
    return ExtractionResultSchema(
        inspection_id=inspection_id,
        total_fields_extracted=len(fields),
        fields=[ExtractedFieldResponse.model_validate(f) for f in fields]
    )

@router.get("/{inspection_id}/fields", response_model=ExtractionResultSchema)
def get_extracted_fields(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves extracted package fields for an inspection session."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    fields = db.query(ExtractedField).filter(ExtractedField.inspection_id == inspection_id).all()
    
    return ExtractionResultSchema(
        inspection_id=inspection_id,
        total_fields_extracted=len(fields),
        fields=[ExtractedFieldResponse.model_validate(f) for f in fields]
    )
