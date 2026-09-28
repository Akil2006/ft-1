import pytest
from app.models.batch import InspectionBatch
from app.models.inspection import Inspection
from app.services.batch_service import batch_service

def test_batch_creation_and_isolation(db, test_user):
    batch = InspectionBatch(
        user_id=test_user.id,
        name="Test Batch",
        status="COMPLETED",
        total_count=3,
        completed_count=2,
        failed_count=1
    )
    db.add(batch)
    db.commit()

    insp1 = Inspection(user_id=test_user.id, batch_id=batch.id, product_name="Product A", status="COMPLETED", overall_result="COMPLIANT")
    insp2 = Inspection(user_id=test_user.id, batch_id=batch.id, product_name="Product B", status="COMPLETED", overall_result="REVIEW_REQUIRED")
    insp3 = Inspection(user_id=test_user.id, batch_id=batch.id, product_name="Product C", status="FAILED", overall_result="REVIEW_REQUIRED")
    db.add_all([insp1, insp2, insp3])
    db.commit()

    inspections = db.query(Inspection).filter(Inspection.batch_id == batch.id).all()
    assert len(inspections) == 3
    assert batch.completed_count == 2
    assert batch.failed_count == 1
