from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.inspection import Inspection
from app.models.extracted_field import ExtractedField
from app.models.compliance_check import ComplianceCheck
from app.rules.registry import rule_registry
from app.rules.engine import compliance_engine
from app.services.extraction_service import extraction_service

class ComplianceService:
    @staticmethod
    def process_inspection_compliance(db: Session, inspection_id: str) -> List[ComplianceCheck]:
        """
        Executes full legal metrology compliance evaluation for an inspection session.
        Deletes old compliance checks, evaluates all registered rules, saves new checks,
        and computes the overall inspection result.
        """
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise ValueError(f"Inspection session {inspection_id} not found")

        inspection.status = "RULE_EVALUATION"
        db.commit()

        # Delete previous compliance checks for this inspection
        db.query(ComplianceCheck).filter(ComplianceCheck.inspection_id == inspection_id).delete()
        db.commit()

        # Ensure field extraction has executed
        extracted_fields = db.query(ExtractedField).filter(ExtractedField.inspection_id == inspection_id).all()
        if not extracted_fields:
            extracted_fields = extraction_service.process_inspection_extraction(db, inspection_id)

        inspection_meta = {
            "product_name": inspection.product_name,
            "category": inspection.category,
            "package_type": inspection.package_type
        }

        all_rules = rule_registry.get_all_rules()
        created_checks: List[ComplianceCheck] = []

        compliant_count = 0
        review_count = 0
        missing_count = 0
        not_applicable_count = 0

        for rule in all_rules:
            eval_res = compliance_engine.evaluate_rule(rule, extracted_fields, inspection_meta)
            
            check = ComplianceCheck(
                inspection_id=inspection_id,
                rule_id=eval_res["rule_id"],
                rule_version=eval_res["rule_version"],
                field_name=eval_res["field_name"],
                applicable=eval_res["applicable"],
                result=eval_res["result"],
                severity=eval_res["severity"],
                detected_value=eval_res["detected_value"],
                reason=eval_res["reason"]
            )
            db.add(check)
            created_checks.append(check)

            # Tally counts
            res_str = eval_res["result"]
            if res_str == "COMPLIANT":
                compliant_count += 1
            elif res_str == "REVIEW_REQUIRED":
                review_count += 1
            elif res_str == "MISSING_INFORMATION":
                missing_count += 1
            elif res_str == "NOT_APPLICABLE":
                not_applicable_count += 1

        # Compute Overall Result
        if missing_count > 0:
            overall = "MISSING_INFORMATION"
        elif review_count > 0:
            overall = "REVIEW_REQUIRED"
        elif compliant_count > 0:
            overall = "COMPLIANT"
        else:
            overall = "NOT_APPLICABLE"

        # Feature 2: Compute Declaration Completeness Score
        # Applicable expected fields exclude NOT_APPLICABLE rules
        applicable_checks = [c for c in created_checks if c.applicable and c.result != "NOT_APPLICABLE"]
        expected_cnt = len(applicable_checks)
        detected_cnt = sum(1 for c in applicable_checks if c.result == "COMPLIANT")

        if expected_cnt > 0:
            completeness = round((detected_cnt / expected_cnt) * 100.0, 2)
        else:
            completeness = None

        inspection.overall_result = overall
        inspection.status = "COMPLETED"
        inspection.completeness_score = completeness
        inspection.expected_fields_count = expected_cnt
        inspection.detected_fields_count = detected_cnt

        db.commit()

        # Feature 4: Generate SHA-256 Tamper-Evident Integrity Hash for completed inspection
        try:
            from app.services.integrity_service import integrity_service
            integrity_service.finalize_inspection(db, inspection_id)
        except Exception:
            pass

        for c in created_checks:
            db.refresh(c)

        return created_checks

compliance_service = ComplianceService()
