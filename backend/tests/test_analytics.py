import pytest
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.models.inspection import Inspection
from app.models.compliance_check import ComplianceCheck
from app.security.password import hash_password
from app.security.auth import create_access_token

def test_empty_database_analytics():
    db = TestingSessionLocal()
    user = User(
        name="Empty Analytics User",
        email="empty@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    token = create_access_token(data={"sub": user.id})
    db.close()

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/analytics", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_inspections"] == 0
    assert data["compliant_count"] == 0
    assert data["compliance_rate"] == 0.0
    assert isinstance(data["frequently_flagged_fields"], list)

def test_real_database_analytics_aggregation():
    db = TestingSessionLocal()
    user = User(
        name="Analytics Tester",
        email="analyticstester@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()

    # Pre-populate 4 inspections: 2 COMPLIANT, 1 REVIEW_REQUIRED, 1 MISSING_INFORMATION
    insp1 = Inspection(user_id=user.id, product_name="Product 1", status="COMPLETED", overall_result="COMPLIANT")
    insp2 = Inspection(user_id=user.id, product_name="Product 2", status="COMPLETED", overall_result="COMPLIANT")
    insp3 = Inspection(user_id=user.id, product_name="Product 3", status="COMPLETED", overall_result="REVIEW_REQUIRED")
    insp4 = Inspection(user_id=user.id, product_name="Product 4", status="COMPLETED", overall_result="MISSING_INFORMATION")
    
    db.add_all([insp1, insp2, insp3, insp4])
    db.commit()

    # Pre-populate flagged compliance checks
    chk1 = ComplianceCheck(inspection_id=insp3.id, rule_id="LM-MRP-001", rule_version="2026.01", field_name="mrp", applicable=True, result="REVIEW_REQUIRED", severity="CRITICAL", reason="Low confidence")
    chk2 = ComplianceCheck(inspection_id=insp4.id, rule_id="LM-MRP-001", rule_version="2026.01", field_name="mrp", applicable=True, result="MISSING_INFORMATION", severity="CRITICAL", reason="Missing MRP")
    chk3 = ComplianceCheck(inspection_id=insp4.id, rule_id="LM-NQ-001", rule_version="2026.01", field_name="net_quantity", applicable=True, result="MISSING_INFORMATION", severity="CRITICAL", reason="Missing NQ")

    db.add_all([chk1, chk2, chk3])
    db.commit()

    token = create_access_token(data={"sub": user.id})
    db.close()

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/analytics", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["total_inspections"] == 4
    assert data["compliant_count"] == 2
    assert data["review_required_count"] == 1
    assert data["missing_info_count"] == 1
    assert data["compliance_rate"] == 50.0  # (2 / 4) * 100

    # Frequently flagged fields check
    flagged = data["frequently_flagged_fields"]
    assert len(flagged) >= 2
    top_flag = flagged[0]
    assert top_flag["field_name"] == "mrp"
    assert top_flag["flag_count"] == 2
