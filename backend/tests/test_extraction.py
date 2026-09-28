import io
import pytest
from PIL import Image as PILImage
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.security.password import hash_password
from app.security.auth import create_access_token
from app.services.extraction_service import FieldExtractor

def create_test_user_token():
    db = TestingSessionLocal()
    user = User(
        name="Extractor Tester",
        email="extracttester@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    token = create_access_token(data={"sub": user.id})
    db.close()
    return token

def test_mrp_extraction_patterns():
    text1 = "MRP ₹120.00 (INCL. OF ALL TAXES)"
    mrp1 = FieldExtractor.extract_mrp(text1)
    assert mrp1 is not None
    assert mrp1["value"] == 120.0
    assert mrp1["currency"] == "INR"
    assert mrp1["tax_inclusive"] is True

    text2 = "M.R.P. Rs 250.50"
    mrp2 = FieldExtractor.extract_mrp(text2)
    assert mrp2 is not None
    assert mrp2["value"] == 250.50

def test_net_quantity_extraction_patterns():
    text1 = "NET WT. 500 g"
    nq1 = FieldExtractor.extract_net_quantity(text1)
    assert nq1 is not None
    assert nq1["value"] == 500.0
    assert nq1["unit"] == "G"

    text2 = "Net Vol: 1.5 L"
    nq2 = FieldExtractor.extract_net_quantity(text2)
    assert nq2 is not None
    assert nq2["value"] == 1.5
    assert nq2["unit"] == "L"

def test_date_extraction_patterns():
    text = "MFD: 08/2026\nEXP: 12-2027\nPKD: 01.2026"
    dates = FieldExtractor.extract_dates(text)
    assert len(dates) >= 2
    types = [d["date_type"] for d in dates]
    assert "manufacturing_date" in types
    assert "expiry_date" in types

def test_manufacturer_and_consumer_care():
    text = "Mfd by: ABC Foods Private Limited\nCustomer Care: 18001234567 email: care@abcfoods.com"
    mfg = FieldExtractor.extract_manufacturer(text)
    assert mfg is not None
    assert "ABC Foods" in mfg["entity_name"]

    cc = FieldExtractor.extract_consumer_care(text)
    assert cc is not None
    assert cc["email"] == "care@abcfoods.com"

def test_country_of_origin():
    text = "Country of Origin: India"
    coo = FieldExtractor.extract_country_of_origin(text)
    assert coo is not None
    assert coo["country"] == "India"

def test_full_inspection_extraction_pipeline():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create Inspection Session
    insp_resp = client.post("/api/v1/inspections", json={"product_name": "Pure Honey"}, headers=headers)
    insp_id = insp_resp.json()["id"]

    # 2. Upload Sample Label Image
    img = PILImage.new("RGB", (200, 200), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    files = [("files", ("honey_label.png", buf.getvalue(), "image/png"))]
    client.post(f"/api/v1/inspections/{insp_id}/images", files=files, headers=headers)

    # 3. Trigger Extraction Endpoint
    ext_resp = client.post(f"/api/v1/inspections/{insp_id}/extract", headers=headers)
    assert ext_resp.status_code == 200
    data = ext_resp.json()
    assert data["inspection_id"] == insp_id
    assert "total_fields_extracted" in data
    assert isinstance(data["fields"], list)

    # 4. Get Extracted Fields Endpoint
    get_resp = client.get(f"/api/v1/inspections/{insp_id}/fields", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["inspection_id"] == insp_id
