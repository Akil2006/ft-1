from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.batch import InspectionBatch
from app.models.inspection import Inspection
from app.schemas.batch import BatchResponse, BatchDetailResponse
from app.schemas.inspection import InspectionResponse
from app.security.auth import get_current_user
from app.services.batch_service import batch_service

router = APIRouter(prefix="/batches", tags=["Batch Inspections"])

@router.post("", response_model=BatchDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_batch_inspection(
    name: Optional[str] = Form("Batch Inspection"),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a Batch Inspection session for multiple package images,
    spawning separate inspection records for each product package and processing them in isolation.
    """
    if not files or len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one package image file is required to create a batch inspection."
        )

    if len(files) > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum batch limit is 20 package images per batch submission."
        )

    files_data = []
    for file in files:
        content = await file.read()
        files_data.append((content, file.filename or "package.png"))

    batch = batch_service.create_and_process_batch(
        db=db,
        user_id=current_user.id,
        name=name or "Batch Inspection",
        files_data=files_data
    )

    inspections = db.query(Inspection).filter(Inspection.batch_id == batch.id).all()
    
    return BatchDetailResponse(
        id=batch.id,
        user_id=batch.user_id,
        name=batch.name,
        status=batch.status,
        total_count=batch.total_count,
        completed_count=batch.completed_count,
        failed_count=batch.failed_count,
        created_at=batch.created_at,
        updated_at=batch.updated_at,
        inspections=[InspectionResponse.model_validate(i) for i in inspections]
    )

@router.get("", response_model=List[BatchResponse])
def list_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists batch inspection sessions created by the current user."""
    batches = db.query(InspectionBatch)\
        .filter(InspectionBatch.user_id == current_user.id)\
        .order_by(InspectionBatch.created_at.desc())\
        .all()
    return batches

@router.get("/{batch_id}", response_model=BatchDetailResponse)
def get_batch(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves batch details and list of associated inspection records."""
    batch = db.query(InspectionBatch)\
        .filter(InspectionBatch.id == batch_id, InspectionBatch.user_id == current_user.id)\
        .first()

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch inspection not found"
        )

    inspections = db.query(Inspection).filter(Inspection.batch_id == batch.id).all()

    return BatchDetailResponse(
        id=batch.id,
        user_id=batch.user_id,
        name=batch.name,
        status=batch.status,
        total_count=batch.total_count,
        completed_count=batch.completed_count,
        failed_count=batch.failed_count,
        created_at=batch.created_at,
        updated_at=batch.updated_at,
        inspections=[InspectionResponse.model_validate(i) for i in inspections]
    )
