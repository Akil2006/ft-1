import os
import pytest
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.models.inspection import Inspection
from app.security.password import hash_password
from app.security.auth import create_access_token
from app.services.report_service import ReportService

def create_test_user_token():
    db = TestingSessionLocal()
    user = User(
        name="Report Tester",
        email="reporttester@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()

    token = create_access_token(data={"sub": user.id})
    db.close()
    return token

def test_generate_pdf_report_file_creation():
    db = TestingSessionLocal()
    user = User(
        name="PDF Generator User",
        email="pdfgen@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()

    insp = Inspection(
        user_id=user.id,
        product_name="Organic Honey Jar",
        category="Food",
        package_type="Glass Bottle",
        status="COMPLETED",
        overall_result="COMPLIANT"
    )
    db.add(insp)
    db.commit()

    pdf_path, rel_url = ReportService.generate_pdf_report(db, insp.id)
    assert pdf_path is not None
    assert os.path.exists(pdf_path)
    assert pdf_path.endswith(".pdf")
    assert "/storage/reports/" in rel_url
    db.close()

def test_download_report_api_endpoint():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Inspection
    insp_resp = client.post("/api/v1/inspections", json={"product_name": "API Report Milk"}, headers=headers)
    insp_id = insp_resp.json()["id"]

    # 2. Run Compliance Check
    client.post(f"/api/v1/inspections/{insp_id}/compliance", headers=headers)

    # 3. GET PDF Report
    report_resp = client.get(f"/api/v1/inspections/{insp_id}/report", headers=headers)
    assert report_resp.status_code == 200
    assert report_resp.headers["content-type"] == "application/pdf"
    assert len(report_resp.content) > 1000  # Non-empty PDF binary
    assert report_resp.content[:4] == b"%PDF"  # Valid PDF magic header
