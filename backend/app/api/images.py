from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.inspection import Inspection
from app.models.image import InspectionImage
from app.schemas.inspection import InspectionImageResponse
from app.security.auth import get_current_user
from app.services.image_service import ImageService
from app.services.preprocessing_service import PreprocessingService

router = APIRouter(prefix="/inspections", tags=["Inspection Images"])

ALLOWED_IMAGE_TYPES = {"FRONT", "BACK", "SIDE", "TOP", "BOTTOM", "OTHER"}

@router.post("/{inspection_id}/images", response_model=List[InspectionImageResponse], status_code=status.HTTP_201_CREATED)
async def upload_inspection_images(
    inspection_id: str,
    files: List[UploadFile] = File(...),
    image_type: Optional[str] = Form("FRONT"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Uploads one or more package images for an inspection session and executes OpenCV preprocessing."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    # Check maximum image limit per inspection (max 10)
    current_count = db.query(InspectionImage).filter(InspectionImage.inspection_id == inspection_id).count()
    if current_count + len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot upload {len(files)} image(s). Maximum limit is 10 images per inspection (currently has {current_count})."
        )

    norm_type = (image_type or "FRONT").upper()
    if norm_type not in ALLOWED_IMAGE_TYPES:
        norm_type = "FRONT"

    created_images = []

    for file in files:
        content = await file.read()
        
        # 1. Validate file
        ext, original_filename = ImageService.validate_image_file(file, content)
        
        # 2. Save original file
        saved_filename, storage_path = ImageService.save_original_image(content, ext)
        
        # 3. Create DB record
        image_record = InspectionImage(
            inspection_id=inspection_id,
            filename=original_filename,
            storage_path=storage_path,
            image_type=norm_type,
            processing_status="PREPROCESSING"
        )
        db.add(image_record)
        db.commit()
        db.refresh(image_record)

        # 4. Execute OpenCV Preprocessing
        try:
            processed_path, width, height = PreprocessingService.preprocess_image(storage_path, image_record.id)
            image_record.width = width
            image_record.height = height
            image_record.processing_status = "PROCESSED"
        except Exception:
            image_record.processing_status = "FAILED"

        db.commit()
        db.refresh(image_record)
        created_images.append(image_record)

    return created_images

@router.get("/{inspection_id}/images", response_model=List[InspectionImageResponse])
def get_inspection_images(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists image records associated with an inspection session."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    return inspection.images
