from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional

from app.database import get_db
from app.models.user import User, UserRole
from app.models.inspection import Inspection
from app.schemas.auth import UserResponse
from app.schemas.admin import UserStatusUpdate, UserRoleUpdate, AdminAnalyticsResponse
from app.schemas.inspection import PaginatedInspectionResponse, InspectionResponse
from app.security.auth import get_current_user, require_role

router = APIRouter(prefix="/admin", tags=["Admin Management"])

# Helper dependency to enforce ADMIN authorization
require_admin = require_role([UserRole.ADMIN])

@router.get("/users", response_model=List[UserResponse])
def list_users(
    role: Optional[UserRole] = Query(None, description="Filter users by role"),
    search: Optional[str] = Query(None, description="Search name or email"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List all registered users in the system."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term)
            )
        )
    return query.order_by(desc(User.created_at)).all()

@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: str,
    status_update: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Activate or deactivate a user account."""
    if user_id == current_user.id and not status_update.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot deactivate their own account"
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_444_NOT_FOUND if hasattr(status, 'HTTP_444_NOT_FOUND') else 404,
            detail="User not found"
        )

    target_user.is_active = status_update.is_active
    db.commit()
    db.refresh(target_user)
    return target_user

@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Change user authorization role."""
    if user_id == current_user.id and role_update.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot revoke their own administrative access"
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    target_user.role = role_update.role
    db.commit()
    db.refresh(target_user)
    return target_user

@router.get("/inspections", response_model=PaginatedInspectionResponse)
def list_all_inspections(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    overall_result: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """View inspections across all users in the system."""
    query = db.query(Inspection)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Inspection.product_name.ilike(search_term),
                Inspection.category.ilike(search_term),
                Inspection.id.ilike(search_term)
            )
        )

    if status_filter:
        query = query.filter(Inspection.status == status_filter)
    if overall_result:
        query = query.filter(Inspection.overall_result == overall_result)
    if category:
        query = query.filter(Inspection.category == category)

    total = query.count()
    pages = (total + limit - 1) // limit if total > 0 else 1
    offset = (page - 1) * limit

    items = query.order_by(desc(Inspection.created_at)).offset(offset).limit(limit).all()

    return PaginatedInspectionResponse(
        total=total,
        page=page,
        limit=limit,
        pages=pages,
        items=items
    )

@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve system-wide user counts and inspection metrics."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_inspections = db.query(Inspection).count()
    completed_inspections = db.query(Inspection).filter(Inspection.status == "COMPLETED").count()
    compliant_count = db.query(Inspection).filter(Inspection.overall_result == "COMPLIANT").count()
    review_required_count = db.query(Inspection).filter(Inspection.overall_result == "REVIEW_REQUIRED").count()
    missing_info_count = db.query(Inspection).filter(Inspection.overall_result == "MISSING_INFORMATION").count()

    return AdminAnalyticsResponse(
        total_users=total_users,
        active_users=active_users,
        total_inspections=total_inspections,
        completed_inspections=completed_inspections,
        compliant_count=compliant_count,
        review_required_count=review_required_count,
        missing_info_count=missing_info_count
    )
