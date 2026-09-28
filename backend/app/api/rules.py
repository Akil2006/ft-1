from typing import List
from fastapi import APIRouter, HTTPException, status
from app.rules.registry import rule_registry
from app.schemas.compliance import RuleSchema

router = APIRouter(prefix="/rules", tags=["Legal Metrology Rules"])

@router.get("", response_model=List[RuleSchema])
def list_rules():
    """Lists all configured Legal Metrology rules."""
    return rule_registry.get_all_rules()

@router.get("/{rule_id}", response_model=RuleSchema)
def get_rule(rule_id: str):
    """Retrieves a specific Legal Metrology rule definition by rule_id."""
    rule = rule_registry.get_rule_by_id(rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rule '{rule_id}' not found"
        )
    return rule
