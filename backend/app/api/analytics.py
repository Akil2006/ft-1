from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsResponseSchema
from app.security.auth import get_current_user
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])

@router.get("", response_model=AnalyticsResponseSchema)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves real-time aggregated dashboard analytics for the current user."""
    analytics_data = analytics_service.get_dashboard_analytics(db, current_user.id)
    return analytics_data
