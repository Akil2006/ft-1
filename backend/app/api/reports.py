import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.inspection import Inspection
from app.security.auth import get_current_user
from app.services.report_service import report_service

router = APIRouter(prefix="/inspections", tags=["PDF Reports"])

@router.get("/{inspection_id}/report")
def download_inspection_report(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates and returns the downloadable PDF inspection report for an inspection session."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    pdf_path, _ = report_service.generate_pdf_report(db, inspection_id)

    if not os.path.exists(pdf_path):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF inspection report file"
        )

    filename = f"SmartPack_Report_{inspection_id[:8]}.pdf"
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=filename
    )
