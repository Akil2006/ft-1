from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.inspection import Inspection
from app.schemas.evidence import InspectionEvidenceResultSchema, EvidenceResponse
from app.security.auth import get_current_user
from app.services.evidence_service import evidence_service

router = APIRouter(prefix="/inspections", tags=["Evidence Verification"])

@router.get("/{inspection_id}/evidence", response_model=InspectionEvidenceResultSchema)
def get_inspection_evidence(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves bounding-box evidence and cropped ROI image snippets for an inspection session."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    evidence_items = evidence_service.get_inspection_evidence(db, inspection_id)
    
    return InspectionEvidenceResultSchema(
        inspection_id=inspection_id,
        total_evidence_items=len(evidence_items),
        evidence=[EvidenceResponse.model_validate(e) for e in evidence_items]
    )
