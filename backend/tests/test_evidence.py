import os
import io
import pytest
from PIL import Image as PILImage
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.security.password import hash_password
from app.security.auth import create_access_token
from app.services.evidence_service import EvidenceService

def create_test_user_token():
    db = TestingSessionLocal()
    user = User(
        name="Evidence Tester",
        email="evidencetester@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    token = create_access_token(data={"sub": user.id})
    db.close()
    return token

def test_generate_roi_crop_function(tmp_path):
    # Create test image file
    img_path = str(tmp_path / "sample_label.png")
    img = PILImage.new("RGB", (400, 400), color=(200, 200, 200))
    img.save(img_path)

    bbox = [50.0, 50.0, 150.0, 150.0]  # x1, y1, x2, y2
    crop_url = EvidenceService.generate_roi_crop(img_path, bbox, "test_ev_001")
    
    assert crop_url is not None
    assert "/storage/evidence/test_ev_001_crop.png" in crop_url
    assert os.path.exists("./storage/evidence/test_ev_001_crop.png")

def test_get_inspection_evidence_api_pipeline():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create Inspection Session
    insp_resp = client.post("/api/v1/inspections", json={"product_name": "Evidence Test Jar"}, headers=headers)
    insp_id = insp_resp.json()["id"]

    # 2. Upload Label Image
    img = PILImage.new("RGB", (300, 300), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    files = [("files", ("honey_label.png", buf.getvalue(), "image/png"))]
    client.post(f"/api/v1/inspections/{insp_id}/images", files=files, headers=headers)

    # 3. Trigger Extraction (populates fields & evidence)
    client.post(f"/api/v1/inspections/{insp_id}/extract", headers=headers)

    # 4. Get Evidence Endpoint
    ev_resp = client.get(f"/api/v1/inspections/{insp_id}/evidence", headers=headers)
    assert ev_resp.status_code == 200
    data = ev_resp.json()
    assert data["inspection_id"] == insp_id
    assert "total_evidence_items" in data
    assert isinstance(data["evidence"], list)
