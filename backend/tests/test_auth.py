import pytest
from datetime import timedelta
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.security.password import verify_password
from app.security.auth import create_access_token

def test_health_still_works():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_user_registration_succeeds_and_hashes_password():
    payload = {
        "name": "Inspector Test",
        "email": "inspector@example.com",
        "password": "SecretPassword123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Inspector Test"
    assert data["email"] == "inspector@example.com"
    assert data["role"] == "USER"
    assert data["is_active"] is True
    assert "password" not in data
    assert "password_hash" not in data

    # Verify in DB directly that password is hashed
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "inspector@example.com").first()
    assert user is not None
    assert user.password_hash != "SecretPassword123"
    assert verify_password("SecretPassword123", user.password_hash)
    db.close()

def test_duplicate_registration_fails():
    payload = {
        "name": "First User",
        "email": "duplicate@example.com",
        "password": "Password123"
    }
    resp1 = client.post("/api/v1/auth/register", json=payload)
    assert resp1.status_code == 201

    # Second attempt with same email
    resp2 = client.post("/api/v1/auth/register", json=payload)
    assert resp2.status_code == 409
    assert "already exists" in resp2.json()["detail"]

def test_login_succeeds_and_returns_jwt():
    reg_payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "MySecretPassword"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "jane@example.com",
        "password": "MySecretPassword"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "jane@example.com"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]

def test_invalid_password_login_fails():
    reg_payload = {
        "name": "Jane Doe",
        "email": "jane2@example.com",
        "password": "MySecretPassword"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "jane2@example.com",
        "password": "WrongPassword"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_nonexistent_user_login_fails():
    login_payload = {
        "email": "nonexistent@example.com",
        "password": "AnyPassword"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_auth_me_with_valid_token():
    reg_payload = {
        "name": "Valid Token User",
        "email": "tokenuser@example.com",
        "password": "Password123"
    }
    client.post("/api/v1/auth/register", json=reg_payload)
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "tokenuser@example.com",
        "password": "Password123"
    })
    token = login_resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["name"] == "Valid Token User"
    assert me_data["email"] == "tokenuser@example.com"
    assert "password" not in me_data
    assert "password_hash" not in me_data

def test_auth_me_rejects_missing_token():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_auth_me_rejects_invalid_token():
    headers = {"Authorization": "Bearer invalid_garbage_token_string"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401

def test_auth_me_rejects_expired_token():
    db = TestingSessionLocal()
    user = User(
        name="Expired User",
        email="expired@example.com",
        password_hash="somehash",
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Expired token (-10 minutes)
    expired_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=-10)
    )
    db.close()

    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401

def test_inactive_user_cannot_access_protected_endpoint():
    db = TestingSessionLocal()
    user = User(
        name="Inactive User",
        email="inactive@example.com",
        password_hash="somehash",
        role=UserRole.USER,
        is_active=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id})
    db.close()

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401
    assert "Inactive user account" in response.json()["detail"]
