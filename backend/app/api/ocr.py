from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.inspection import Inspection
from app.schemas.ocr import OCRResultSchema
from app.security.auth import get_current_user
from app.services.ocr_service import ocr_service

router = APIRouter(prefix="/inspections", tags=["OCR Processing"])

@router.post("/{inspection_id}/ocr", response_model=OCRResultSchema)
def trigger_inspection_ocr(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Triggers the OCR extraction pipeline on all images for an inspection session."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    ocr_result = ocr_service.process_inspection_ocr(db, inspection_id)
    return ocr_result

@router.get("/{inspection_id}/ocr", response_model=OCRResultSchema)
def get_inspection_ocr(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves OCR text extraction results for an inspection session."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    ocr_result = ocr_service.process_inspection_ocr(db, inspection_id)
    return ocr_result
