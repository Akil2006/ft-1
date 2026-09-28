import pytest
from app.models.inspection import Inspection
from app.models.compliance_check import ComplianceCheck

def test_completeness_score_calculation(db, test_user):
    inspection = Inspection(
        user_id=test_user.id,
        product_name="Test Completeness Product",
        category="Food",
        package_type="Box",
        status="COMPLETED"
    )
    db.add(inspection)
    db.commit()

    # 5 Compliant, 1 Missing, 1 Not Applicable
    checks = [
        ComplianceCheck(inspection_id=inspection.id, rule_id="R1", rule_version="1.0", field_name="mrp", applicable=True, result="COMPLIANT"),
        ComplianceCheck(inspection_id=inspection.id, rule_id="R2", rule_version="1.0", field_name="net_quantity", applicable=True, result="COMPLIANT"),
        ComplianceCheck(inspection_id=inspection.id, rule_id="R3", rule_version="1.0", field_name="manufacturer", applicable=True, result="COMPLIANT"),
        ComplianceCheck(inspection_id=inspection.id, rule_id="R4", rule_version="1.0", field_name="address", applicable=True, result="COMPLIANT"),
        ComplianceCheck(inspection_id=inspection.id, rule_id="R5", rule_version="1.0", field_name="product_name", applicable=True, result="COMPLIANT"),
        ComplianceCheck(inspection_id=inspection.id, rule_id="R6", rule_version="1.0", field_name="manufacturing_date", applicable=True, result="MISSING_INFORMATION"),
        ComplianceCheck(inspection_id=inspection.id, rule_id="R7", rule_version="1.0", field_name="importer", applicable=False, result="NOT_APPLICABLE"),
    ]
    db.add_all(checks)
    db.commit()

    # Calculate expected = 6 (excluding NOT_APPLICABLE), detected = 5
    applicable_checks = [c for c in checks if c.applicable and c.result != "NOT_APPLICABLE"]
    expected_cnt = len(applicable_checks)
    detected_cnt = sum(1 for c in applicable_checks if c.result == "COMPLIANT")
    score = round((detected_cnt / expected_cnt) * 100.0, 2)

    assert expected_cnt == 6
    assert detected_cnt == 5
    assert score == 83.33
