from pydantic import BaseModel, Field
from app.models.user import UserRole

class UserStatusUpdate(BaseModel):
    is_active: bool

class UserRoleUpdate(BaseModel):
    role: UserRole

class AdminAnalyticsResponse(BaseModel):
    total_users: int
    active_users: int
    total_inspections: int
    completed_inspections: int
    compliant_count: int
    review_required_count: int
    missing_info_count: int
