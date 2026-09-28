import os
import io
import pytest
from PIL import Image as PILImage
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.security.password import hash_password
from app.security.auth import create_access_token

def create_test_user_token():
    db = TestingSessionLocal()
    user = User(
        name="Image Tester",
        email="imagetester@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    token = create_access_token(data={"sub": user.id})
    db.close()
    return token

def generate_sample_image_bytes(width=200, height=200, format="PNG"):
    img = PILImage.new("RGB", (width, height), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

def test_create_inspection_session():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "product_name": "Organic Honey",
        "category": "Food",
        "package_type": "Glass Jar"
    }
    response = client.post("/api/v1/inspections", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["product_name"] == "Organic Honey"
    assert data["status"] == "UPLOADED"

def test_upload_valid_image_and_execute_preprocessing():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create inspection
    insp_resp = client.post("/api/v1/inspections", json={"product_name": "Test Milk"}, headers=headers)
    insp_id = insp_resp.json()["id"]

    # 2. Upload valid sample PNG image
    img_bytes = generate_sample_image_bytes(300, 300, "PNG")
    files = [("files", ("front_label.png", img_bytes, "image/png"))]
    data = {"image_type": "FRONT"}
    
    upload_resp = client.post(f"/api/v1/inspections/{insp_id}/images", files=files, data=data, headers=headers)
    assert upload_resp.status_code == 201
    images = upload_resp.json()
    assert len(images) == 1
    image_record = images[0]
    assert image_record["filename"] == "front_label.png"
    assert image_record["image_type"] == "FRONT"
    assert image_record["processing_status"] == "PROCESSED"
    assert image_record["width"] == 300
    assert image_record["height"] == 300

    # 3. Verify physical files exist
    assert os.path.exists(image_record["storage_path"])
    processed_path = os.path.join("./storage/processed", f"{image_record['id']}_processed.png")
    assert os.path.exists(processed_path)

def test_upload_invalid_extension_rejected():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    insp_resp = client.post("/api/v1/inspections", json={"product_name": "Test Product"}, headers=headers)
    insp_id = insp_resp.json()["id"]

    # Upload invalid extension (.exe)
    invalid_bytes = b"echo 'malicious content'"
    files = [("files", ("script.exe", invalid_bytes, "application/x-msdownload"))]
    
    upload_resp = client.post(f"/api/v1/inspections/{insp_id}/images", files=files, headers=headers)
    assert upload_resp.status_code == 400
    assert "Unsupported file format" in upload_resp.json()["detail"]

def test_upload_exceeds_image_limit():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    insp_resp = client.post("/api/v1/inspections", json={"product_name": "Bulk Images Test"}, headers=headers)
    insp_id = insp_resp.json()["id"]

    # Create 11 images
    img_bytes = generate_sample_image_bytes(100, 100, "PNG")
    files = [("files", (f"img_{i}.png", img_bytes, "image/png")) for i in range(11)]
    
    upload_resp = client.post(f"/api/v1/inspections/{insp_id}/images", files=files, headers=headers)
    assert upload_resp.status_code == 400
    assert "Maximum limit is 10 images" in upload_resp.json()["detail"]

def test_list_and_delete_inspection():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create inspection
    insp_resp = client.post("/api/v1/inspections", json={"product_name": "ToDelete"}, headers=headers)
    insp_id = insp_resp.json()["id"]

    # Upload 1 image
    img_bytes = generate_sample_image_bytes(100, 100, "PNG")
    files = [("files", ("delete_me.png", img_bytes, "image/png"))]
    upload_resp = client.post(f"/api/v1/inspections/{insp_id}/images", files=files, headers=headers)
    storage_path = upload_resp.json()[0]["storage_path"]
    assert os.path.exists(storage_path)

    # List images
    list_resp = client.get(f"/api/v1/inspections/{insp_id}/images", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    # Delete inspection
    del_resp = client.delete(f"/api/v1/inspections/{insp_id}", headers=headers)
    assert del_resp.status_code == 204

    # Confirm physical file cleaned up
    assert not os.path.exists(storage_path)
