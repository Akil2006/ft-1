import os
import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.database import get_db
from app.models.user import User
from app.models.inspection import Inspection
from app.schemas.inspection import InspectionCreate, InspectionResponse, PaginatedInspectionResponse
from app.security.auth import get_current_user

router = APIRouter(prefix="/inspections", tags=["Inspections"])

@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
def create_inspection(
    payload: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Creates a new package inspection session."""
    inspection = Inspection(
        user_id=current_user.id,
        product_name=payload.product_name,
        category=payload.category,
        package_type=payload.package_type,
        status="UPLOADED"
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)
    return inspection

@router.get("", response_model=PaginatedInspectionResponse)
def list_inspections(
    search: Optional[str] = Query(None, description="Search term for product name, category, or ID"),
    status: Optional[str] = Query(None, description="Filter by status e.g. UPLOADED, COMPLETED"),
    overall_result: Optional[str] = Query(None, description="Filter by overall result e.g. COMPLIANT, REVIEW_REQUIRED, MISSING_INFORMATION"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    sort_by: str = Query("created_at", description="Sort by field e.g. created_at, product_name"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page index"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists inspection sessions with filtering, search, sorting, and pagination."""
    query = db.query(Inspection).filter(Inspection.user_id == current_user.id)

    # 1. Search Filter
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Inspection.product_name.ilike(search_pattern),
                Inspection.category.ilike(search_pattern),
                Inspection.id.ilike(search_pattern)
            )
        )

    # 2. Category Filter
    if category:
        query = query.filter(Inspection.category.ilike(f"%{category.strip()}%"))

    # 3. Status Filter
    if status:
        query = query.filter(Inspection.status == status.strip().upper())

    # 4. Overall Result Filter
    if overall_result:
        query = query.filter(Inspection.overall_result == overall_result.strip().upper())

    # Total count after filters
    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1

    # 5. Sorting
    sort_attr = getattr(Inspection, sort_by, Inspection.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_attr))
    else:
        query = query.order_by(desc(sort_attr))

    # 6. Pagination
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()

    return PaginatedInspectionResponse(
        total=total,
        page=page,
        limit=limit,
        pages=pages,
        items=[InspectionResponse.model_validate(i) for i in items]
    )

@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves details of a specific inspection session."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )
    return inspection

@router.delete("/{inspection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inspection(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes an inspection session and cleans up associated physical files."""
    inspection = db.query(Inspection)\
        .filter(Inspection.id == inspection_id, Inspection.user_id == current_user.id)\
        .first()
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection session not found"
        )

    # Clean up physical image files
    for image in inspection.images:
        if image.storage_path and os.path.exists(image.storage_path):
            try:
                os.remove(image.storage_path)
            except OSError:
                pass

    db.delete(inspection)
    db.commit()
    return None
