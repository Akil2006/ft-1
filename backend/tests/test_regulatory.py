import pytest
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.security.password import hash_password
from app.security.auth import create_access_token

def get_auth_headers():
    db = TestingSessionLocal()
    user = User(
        name="Regulatory Tester",
        email="regulatory@example.com",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    token = create_access_token(data={"sub": user.id})
    db.close()
    return {"Authorization": f"Bearer {token}"}

def test_query_regulatory_assistant():
    headers = get_auth_headers()
    payload = {"query": "What are the rules regarding MRP declaration?"}
    response = client.post("/api/v1/regulatory/query", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == payload["query"]
    assert "MRP" in data["answer"] or "Maximum Retail Price" in data["answer"] or "Rule 6(1)(e)" in data["answer"]
    assert len(data["matched_sections"]) > 0
    assert "DISCLAIMER" in data["disclaimer"]

def test_get_regulatory_sections():
    headers = get_auth_headers()
    response = client.get("/api/v1/regulatory/sections", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    first = data[0]
    assert "id" in first
    assert "act_or_rule" in first
    assert "section_number" in first

def test_query_unauthenticated():
    response = client.post("/api/v1/regulatory/query", json={"query": "test query"})
    assert response.status_code == 401
