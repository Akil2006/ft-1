import sys
import argparse
import getpass
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.security.password import hash_password

def create_admin_user(name: str, email: str, password: str) -> User:
    """Creates a user with UserRole.ADMIN in the database."""
    db: Session = SessionLocal()
    try:
        normalized_email = email.strip().lower()
        existing = db.query(User).filter(User.email == normalized_email).first()
        if existing:
            if existing.role == UserRole.ADMIN:
                print(f"User '{normalized_email}' is already an Admin.")
                return existing
            print(f"Promoting existing user '{normalized_email}' to Admin...")
            existing.role = UserRole.ADMIN
            existing.is_active = True
            db.commit()
            db.refresh(existing)
            print(f"Successfully promoted '{normalized_email}' to Admin!")
            return existing

        admin_user = User(
            name=name.strip(),
            email=normalized_email,
            password_hash=hash_password(password),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"Successfully created Administrator account for '{normalized_email}'!")
        return admin_user
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Create a SmartPack Administrator Account")
    parser.add_argument("--name", type=str, help="Full name of administrator")
    parser.add_argument("--email", type=str, help="Email address")
    parser.add_argument("--password", type=str, help="Secure password")

    args = parser.parse_args()

    name = args.name or input("Admin Full Name: ").strip()
    email = args.email or input("Admin Email: ").strip()
    password = args.password
    if not password:
        password = getpass.getpass("Admin Password: ").strip()

    if not name or not email or not password:
        print("Error: Name, email, and password are required.")
        sys.exit(1)

    create_admin_user(name, email, password)

if __name__ == "__main__":
    main()
