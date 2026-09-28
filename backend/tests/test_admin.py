import pytest
from tests.conftest import client, TestingSessionLocal
from app.models.user import User, UserRole
from app.security.password import hash_password
from app.security.auth import create_access_token
from app.utils.create_admin import create_admin_user

def create_test_users():
    db = TestingSessionLocal()
    
    # 1. Normal User
    user = User(
        name="Normal Inspector",
        email="normal@metrology.gov.in",
        password_hash=hash_password("password123"),
        role=UserRole.USER,
        is_active=True,
    )
    
    # 2. Admin User
    admin = User(
        name="System Admin",
        email="admin@metrology.gov.in",
        password_hash=hash_password("adminpass123"),
        role=UserRole.ADMIN,
        is_active=True,
    )

    db.add_all([user, admin])
    db.commit()
    
    user_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    admin_token = create_access_token(data={"sub": admin.id, "email": admin.email, "role": admin.role})
    
    user_id = user.id
    admin_id = admin.id
    db.close()
    
    return {
        "user_id": user_id,
        "admin_id": admin_id,
        "user_headers": {"Authorization": f"Bearer {user_token}"},
        "admin_headers": {"Authorization": f"Bearer {admin_token}"},
    }

def test_public_registration_forces_user_role():
    payload = {
        "name": "Self Registered User",
        "email": "selfreg@example.com",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "USER"

def test_normal_user_denied_admin_endpoints():
    data = create_test_users()
    headers = data["user_headers"]

    # 1. Admin Users List
    r1 = client.get("/api/v1/admin/users", headers=headers)
    assert r1.status_code == 403

    # 2. Admin Inspections
    r2 = client.get("/api/v1/admin/inspections", headers=headers)
    assert r2.status_code == 403

    # 3. Admin Analytics
    r3 = client.get("/api/v1/admin/analytics", headers=headers)
    assert r3.status_code == 403

def test_admin_allowed_admin_endpoints():
    data = create_test_users()
    headers = data["admin_headers"]

    # 1. Users List
    r1 = client.get("/api/v1/admin/users", headers=headers)
    assert r1.status_code == 200
    users = r1.json()
    assert len(users) >= 2

    # 2. Inspections List
    r2 = client.get("/api/v1/admin/inspections", headers=headers)
    assert r2.status_code == 200

    # 3. Admin Analytics
    r3 = client.get("/api/v1/admin/analytics", headers=headers)
    assert r3.status_code == 200
    metrics = r3.json()
    assert metrics["total_users"] >= 2
    assert metrics["active_users"] >= 2

def test_admin_user_status_toggle_and_self_protection():
    data = create_test_users()
    admin_headers = data["admin_headers"]
    user_id = data["user_id"]
    admin_id = data["admin_id"]

    # Deactivate normal user
    r1 = client.patch(f"/api/v1/admin/users/{user_id}/status", json={"is_active": False}, headers=admin_headers)
    assert r1.status_code == 200
    assert r1.json()["is_active"] is False

    # Reactivate normal user
    r2 = client.patch(f"/api/v1/admin/users/{user_id}/status", json={"is_active": True}, headers=admin_headers)
    assert r2.status_code == 200
    assert r2.json()["is_active"] is True

    # Prevent Admin self deactivation
    r3 = client.patch(f"/api/v1/admin/users/{admin_id}/status", json={"is_active": False}, headers=admin_headers)
    assert r3.status_code == 400
    assert "cannot deactivate their own account" in r3.json()["detail"]

def test_admin_user_role_update_and_self_protection():
    data = create_test_users()
    admin_headers = data["admin_headers"]
    user_id = data["user_id"]
    admin_id = data["admin_id"]

    # Promote normal user to INSPECTOR
    r1 = client.patch(f"/api/v1/admin/users/{user_id}/role", json={"role": "INSPECTOR"}, headers=admin_headers)
    assert r1.status_code == 200
    assert r1.json()["role"] == "INSPECTOR"

    # Prevent Admin self demotion
    r2 = client.patch(f"/api/v1/admin/users/{admin_id}/role", json={"role": "USER"}, headers=admin_headers)
    assert r2.status_code == 400
    assert "cannot revoke their own" in r2.json()["detail"]

def test_admin_seed_utility():
    admin = create_admin_user("Seeded Admin", "seededadmin@example.com", "securepass123")
    assert admin.email == "seededadmin@example.com"
    assert admin.role == UserRole.ADMIN
