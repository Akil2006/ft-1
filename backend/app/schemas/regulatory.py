from typing import List, Optional
from pydantic import BaseModel, Field

class RegulatorySectionResponse(BaseModel):
    id: str
    act_or_rule: str
    section_number: str
    title: str
    text: str
    summary: str
    relevance_score: float

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class RegulatoryQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Question regarding Legal Metrology rules")
    history: Optional[List[ChatMessage]] = None

class RegulatoryQueryResponse(BaseModel):
    query: str
    answer: str
    matched_sections: List[RegulatorySectionResponse] = []
    disclaimer: str
    suggested_followups: Optional[List[str]] = []

