from fastapi import APIRouter, Depends
from typing import List
from app.schemas.regulatory import RegulatoryQueryRequest, RegulatoryQueryResponse, RegulatorySectionResponse
from app.services.regulatory_service import regulatory_service
from app.security.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/regulatory", tags=["Regulatory Assistant"])

@router.post("/query", response_model=RegulatoryQueryResponse)
def query_regulatory(
    request: RegulatoryQueryRequest,
    current_user: User = Depends(get_current_user)
):
    """Query grounded Legal Metrology assistant for rule clarifications and legal provisions."""
    return regulatory_service.query_regulatory_assistant(request.query)

@router.get("/sections", response_model=List[RegulatorySectionResponse])
def get_regulatory_sections(
    current_user: User = Depends(get_current_user)
):
    """Get all loaded Legal Metrology statutory provisions and guidelines."""
    sections = regulatory_service.get_all_sections()
    return [
        RegulatorySectionResponse(
            id=s["id"],
            act_or_rule=s["act_or_rule"],
            section_number=s["section_number"],
            title=s["title"],
            text=s["text"],
            summary=s["summary"],
            relevance_score=1.0
        )
        for s in sections
    ]
