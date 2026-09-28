import json
import pytest
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.models.extracted_field import ExtractedField
from app.security.password import hash_password
from app.security.auth import create_access_token
from app.rules.registry import rule_registry
from app.rules.applicability import applicability_engine
from app.rules.engine import compliance_engine

def create_test_user_token():
    db = TestingSessionLocal()
    user = User(
        name="Rules Tester",
        email="rulestester@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    token = create_access_token(data={"sub": user.id})
    db.close()
    return token

def test_load_and_list_rules():
    rules = rule_registry.get_all_rules()
    assert len(rules) >= 7
    mrp_rule = rule_registry.get_rule_by_id("LM-MRP-001")
    assert mrp_rule is not None
    assert mrp_rule["field"] == "mrp"
    assert mrp_rule["severity"] == "CRITICAL"

def test_rule_applicability():
    mrp_rule = rule_registry.get_rule_by_id("LM-MRP-001")
    app_status, _ = applicability_engine.evaluate_applicability(mrp_rule, {"category": "Food"})
    assert app_status is True

    coo_rule = rule_registry.get_rule_by_id("LM-COO-001")
    app_status_domestic, _ = applicability_engine.evaluate_applicability(coo_rule, {"category": "Domestic Goods"})
    assert app_status_domestic is False

def test_compliance_engine_missing_information():
    rule = rule_registry.get_rule_by_id("LM-MRP-001")
    # Empty extracted fields list
    res = compliance_engine.evaluate_rule(rule, [], {"category": "Food"})
    assert res["result"] == "MISSING_INFORMATION"
    assert res["applicable"] is True

def test_compliance_engine_review_required_low_confidence():
    rule = rule_registry.get_rule_by_id("LM-NQ-001")
    low_conf_field = ExtractedField(
        inspection_id="dummy",
        field_name="net_quantity",
        raw_value="500 g",
        confidence=0.50, # Below 0.75
        status="DETECTED"
    )
    res = compliance_engine.evaluate_rule(rule, [low_conf_field], {"category": "Food"})
    assert res["result"] == "REVIEW_REQUIRED"
    assert "below 75% threshold" in res["reason"]

def test_compliance_engine_compliant_result():
    rule = rule_registry.get_rule_by_id("LM-NQ-001")
    high_conf_field = ExtractedField(
        inspection_id="dummy",
        field_name="net_quantity",
        raw_value="500 g",
        confidence=0.95,
        status="DETECTED"
    )
    res = compliance_engine.evaluate_rule(rule, [high_conf_field], {"category": "Food"})
    assert res["result"] == "COMPLIANT"

def test_rules_and_compliance_api_endpoints():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Test List Rules API
    rules_resp = client.get("/api/v1/rules")
    assert rules_resp.status_code == 200
    assert len(rules_resp.json()) >= 7

    # 2. Test Get Single Rule API
    single_resp = client.get("/api/v1/rules/LM-MRP-001")
    assert single_resp.status_code == 200
    assert single_resp.json()["rule_id"] == "LM-MRP-001"

    # 3. Create Inspection
    insp_resp = client.post("/api/v1/inspections", json={"product_name": "Rule Check Honey"}, headers=headers)
    insp_id = insp_resp.json()["id"]

    # 4. Trigger Compliance Check Endpoint
    comp_resp = client.post(f"/api/v1/inspections/{insp_id}/compliance", headers=headers)
    assert comp_resp.status_code == 200
    data = comp_resp.json()
    assert data["inspection_id"] == insp_id
    assert "overall_result" in data
    assert data["total_rules_checked"] >= 7
    assert isinstance(data["checks"], list)

    # 5. Get Compliance Results Endpoint
    get_res_resp = client.get(f"/api/v1/inspections/{insp_id}/results", headers=headers)
    assert get_res_resp.status_code == 200
    assert get_res_resp.json()["inspection_id"] == insp_id
