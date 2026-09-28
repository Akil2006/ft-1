import io
import pytest
from PIL import Image as PILImage
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.security.password import hash_password
from app.security.auth import create_access_token
from app.services.ocr.ocr_manager import ocr_manager
from app.services.ocr.cv_contour_engine import CVContourOCREngine

def create_test_user_token():
    db = TestingSessionLocal()
    user = User(
        name="OCR Tester",
        email="ocrtester@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    token = create_access_token(data={"sub": user.id})
    db.close()
    return token

def generate_sample_image_bytes():
    # Generate image with contrast shapes simulating text blocks
    img = PILImage.new("RGB", (300, 200), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def test_ocr_manager_engine_availability():
    engine = ocr_manager.get_preferred_engine()
    assert engine is not None
    assert engine.is_available() is True

def test_cv_contour_fallback_extraction():
    cv_engine = CVContourOCREngine()
    assert cv_engine.name == "cv_contour_fallback"
    assert cv_engine.is_available() is True

def test_ocr_session_pipeline():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create Inspection
    insp_resp = client.post("/api/v1/inspections", json={"product_name": "OCR Package"}, headers=headers)
    insp_id = insp_resp.json()["id"]

    # 2. Upload Image
    img_bytes = generate_sample_image_bytes()
    files = [("files", ("label.png", img_bytes, "image/png"))]
    client.post(f"/api/v1/inspections/{insp_id}/images", files=files, headers=headers)

    # 3. Trigger OCR Endpoint
    ocr_resp = client.post(f"/api/v1/inspections/{insp_id}/ocr", headers=headers)
    assert ocr_resp.status_code == 200
    data = ocr_resp.json()
    assert data["inspection_id"] == insp_id
    assert "total_text_blocks" in data
    assert "engine_used" in data
    assert isinstance(data["items"], list)

    # 4. GET OCR endpoint
    get_ocr_resp = client.get(f"/api/v1/inspections/{insp_id}/ocr", headers=headers)
    assert get_ocr_resp.status_code == 200
    assert get_ocr_resp.json()["inspection_id"] == insp_id
