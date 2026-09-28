import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session

from app.models.inspection import Inspection
from app.models.extracted_field import ExtractedField
from app.models.compliance_check import ComplianceCheck
from app.models.image import InspectionImage

class IntegrityService:
    @staticmethod
    def build_canonical_data(db: Session, inspection: Inspection) -> Dict[str, Any]:
        """
        Constructs a deterministic canonical dictionary representation of an inspection.
        Only includes authoritative finalized data (excludes volatile view counts or timestamps).
        """
        fields = db.query(ExtractedField).filter(ExtractedField.inspection_id == inspection.id).all()
        checks = db.query(ComplianceCheck).filter(ComplianceCheck.inspection_id == inspection.id).all()
        images = db.query(InspectionImage).filter(InspectionImage.inspection_id == inspection.id).all()

        canonical = {
            "inspection_id": inspection.id,
            "user_id": inspection.user_id,
            "product_name": inspection.product_name or "",
            "category": inspection.category or "",
            "package_type": inspection.package_type or "",
            "created_at": inspection.created_at.strftime("%Y-%m-%dT%H:%M:%SZ") if inspection.created_at else "",
            "status": inspection.status,
            "overall_result": inspection.overall_result or "",
            "completeness_score": inspection.completeness_score,
            "extracted_fields": sorted([
                {
                    "field_name": f.field_name,
                    "raw_value": f.raw_value or "",
                    "normalized_value": f.normalized_value or "",
                    "confidence": float(f.confidence),
                    "status": f.status
                }
                for f in fields
            ], key=lambda x: x["field_name"]),
            "compliance_checks": sorted([
                {
                    "rule_id": c.rule_id,
                    "rule_version": c.rule_version,
                    "field_name": c.field_name,
                    "applicable": c.applicable,
                    "result": c.result,
                    "severity": c.severity,
                    "detected_value": c.detected_value or "",
                    "reason": c.reason or ""
                }
                for c in checks
            ], key=lambda x: x["rule_id"]),
            "images": sorted([
                {
                    "id": img.id,
                    "filename": img.filename,
                    "image_type": img.image_type
                }
                for img in images
            ], key=lambda x: x["id"])
        }
        return canonical

    @classmethod
    def generate_sha256_hash(cls, canonical_data: Dict[str, Any]) -> str:
        """Serializes canonical dictionary to sorted JSON string and computes SHA-256 hash."""
        canonical_json = json.dumps(canonical_data, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

    @classmethod
    def finalize_inspection(cls, db: Session, inspection_id: str) -> Inspection:
        """
        Computes SHA-256 digital fingerprint and saves integrity_hash for a finalized inspection.
        """
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise ValueError(f"Inspection session {inspection_id} not found")

        canonical_data = cls.build_canonical_data(db, inspection)
        hash_val = cls.generate_sha256_hash(canonical_data)

        inspection.integrity_hash = hash_val
        inspection.hash_algorithm = "SHA-256"
        inspection.hash_generated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(inspection)
        return inspection

    @classmethod
    def verify_inspection_integrity(cls, db: Session, inspection_id: str) -> Dict[str, Any]:
        """
        Verifies record integrity by comparing calculated canonical hash against stored hash.
        """
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise ValueError(f"Inspection session {inspection_id} not found")

        stored_hash = inspection.integrity_hash
        if not stored_hash:
            return {
                "valid": True,
                "algorithm": "SHA-256",
                "stored_hash": None,
                "calculated_hash": None,
                "message": "Inspection record is unfinalized (legacy/NULL hash)."
            }

        canonical_data = cls.build_canonical_data(db, inspection)
        calculated_hash = cls.generate_sha256_hash(canonical_data)

        is_valid = (stored_hash == calculated_hash)
        message = (
            "Record integrity verified."
            if is_valid else
            "Inspection data differs from the original finalized record."
        )

        return {
            "valid": is_valid,
            "algorithm": inspection.hash_algorithm or "SHA-256",
            "stored_hash": stored_hash,
            "calculated_hash": calculated_hash,
            "hash_generated_at": inspection.hash_generated_at.isoformat() if inspection.hash_generated_at else None,
            "message": message
        }

integrity_service = IntegrityService()
