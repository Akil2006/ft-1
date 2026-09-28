import pytest
from app.models.inspection import Inspection
from app.services.integrity_service import integrity_service

def test_sha256_integrity_hash_generation_and_verification(db, test_user):
    inspection = Inspection(
        user_id=test_user.id,
        product_name="Integrity Test Package",
        category="Food",
        package_type="Box",
        status="COMPLETED",
        overall_result="COMPLIANT"
    )
    db.add(inspection)
    db.commit()

    # 1. Finalize inspection -> generates SHA-256 hash
    fin_insp = integrity_service.finalize_inspection(db, inspection.id)
    assert fin_insp.integrity_hash is not None
    assert len(fin_insp.integrity_hash) == 64
    assert fin_insp.hash_algorithm == "SHA-256"

    # 2. Verify intact inspection -> Valid
    result = integrity_service.verify_inspection_integrity(db, inspection.id)
    assert result["valid"] is True
    assert result["algorithm"] == "SHA-256"
    assert "Record integrity verified" in result["message"]

    # 3. Simulate tamper modification to product name
    inspection.product_name = "Tampered Product Name"
    db.commit()

    # 4. Verify tampered inspection -> Invalid
    tamper_result = integrity_service.verify_inspection_integrity(db, inspection.id)
    assert tamper_result["valid"] is False
    assert "differs from the original" in tamper_result["message"]
