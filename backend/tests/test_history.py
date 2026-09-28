import pytest
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.models.inspection import Inspection
from app.security.password import hash_password
from app.security.auth import create_access_token

def create_test_user_token():
    db = TestingSessionLocal()
    user = User(
        name="History Tester",
        email="historytester@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()

    # Pre-populate multiple inspection records
    items = [
        Inspection(user_id=user.id, product_name="Organic Honey", category="Food", status="COMPLETED", overall_result="COMPLIANT"),
        Inspection(user_id=user.id, product_name="Almond Milk", category="Food", status="COMPLETED", overall_result="REVIEW_REQUIRED"),
        Inspection(user_id=user.id, product_name="Face Wash", category="Cosmetics", status="UPLOADED", overall_result="MISSING_INFORMATION"),
        Inspection(user_id=user.id, product_name="Green Tea", category="Food", status="COMPLETED", overall_result="COMPLIANT"),
        Inspection(user_id=user.id, product_name="Protein Powder", category="Nutrition", status="FAILED", overall_result="MISSING_INFORMATION"),
    ]
    db.add_all(items)
    db.commit()

    token = create_access_token(data={"sub": user.id})
    db.close()
    return token

def test_search_inspections_by_product_name():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Search for "Honey"
    response = client.get("/api/v1/inspections?search=Honey", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["product_name"] == "Organic Honey"

def test_filter_inspections_by_status_and_result():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Filter by overall_result=COMPLIANT
    response = client.get("/api/v1/inspections?overall_result=COMPLIANT", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    for item in data["items"]:
        assert item["overall_result"] == "COMPLIANT"

    # Filter by category=Cosmetics
    cat_resp = client.get("/api/v1/inspections?category=Cosmetics", headers=headers)
    assert cat_resp.status_code == 200
    assert cat_resp.json()["total"] == 1

def test_inspections_pagination_and_sorting():
    token = create_test_user_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Paginate page 1, limit 2, sorted by product_name ASC
    response = client.get("/api/v1/inspections?page=1&limit=2&sort_by=product_name&sort_order=asc", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert data["page"] == 1
    assert data["limit"] == 2
    assert data["pages"] == 3
    assert len(data["items"]) == 2
    # Verify ascending alphabetical order: Almond Milk, Face Wash
    assert data["items"][0]["product_name"] == "Almond Milk"
    assert data["items"][1]["product_name"] == "Face Wash"
