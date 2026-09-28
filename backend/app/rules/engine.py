import json
from typing import List, Dict, Any
from app.models.extracted_field import ExtractedField
from app.rules.registry import rule_registry
from app.rules.applicability import applicability_engine

class ComplianceEngine:
    """
    Deterministic Legal Metrology Compliance Rule Engine.
    Evaluates extracted fields against versioned legal rules without using an LLM.
    """
    @staticmethod
    def evaluate_rule(
        rule: Dict[str, Any],
        extracted_fields: List[ExtractedField],
        inspection_meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        rule_id = rule["rule_id"]
        rule_version = rule["rule_version"]
        target_field_name = rule["field"]
        severity = rule.get("severity", "HIGH")

        # 1. Evaluate Applicability
        app_status, app_reason = applicability_engine.evaluate_applicability(rule, inspection_meta)

        if app_status is False:
            return {
                "rule_id": rule_id,
                "rule_version": rule_version,
                "field_name": target_field_name,
                "applicable": False,
                "result": "NOT_APPLICABLE",
                "severity": severity,
                "detected_value": None,
                "reason": app_reason
            }

        if app_status == "REVIEW":
            return {
                "rule_id": rule_id,
                "rule_version": rule_version,
                "field_name": target_field_name,
                "applicable": True,
                "result": "REVIEW_REQUIRED",
                "severity": severity,
                "detected_value": None,
                "reason": app_reason
            }

        # 2. Match Extracted Field
        matching_field = next((f for f in extracted_fields if f.field_name == target_field_name), None)

        if not matching_field or not matching_field.raw_value:
            return {
                "rule_id": rule_id,
                "rule_version": rule_version,
                "field_name": target_field_name,
                "applicable": True,
                "result": "MISSING_INFORMATION",
                "severity": severity,
                "detected_value": None,
                "reason": f"Mandatory declaration '{rule['rule_title']}' could not be detected on package labels."
            }

        # 3. Check Confidence Threshold (0.75)
        conf_percentage = round(matching_field.confidence * 100.0, 1)
        if matching_field.confidence < 0.75:
            return {
                "rule_id": rule_id,
                "rule_version": rule_version,
                "field_name": target_field_name,
                "applicable": True,
                "result": "REVIEW_REQUIRED",
                "severity": severity,
                "detected_value": matching_field.raw_value,
                "reason": f"Field detected ('{matching_field.raw_value}') but OCR confidence ({conf_percentage}%) is below 75% threshold; human review required."
            }

        # 4. Check Specific Rule Format Requirements
        if rule_id == "LM-MRP-001":
            try:
                norm_dict = json.loads(matching_field.normalized_value or "{}")
                if not norm_dict.get("tax_inclusive", False):
                    return {
                        "rule_id": rule_id,
                        "rule_version": rule_version,
                        "field_name": target_field_name,
                        "applicable": True,
                        "result": "REVIEW_REQUIRED",
                        "severity": severity,
                        "detected_value": matching_field.raw_value,
                        "reason": f"MRP detected ('{matching_field.raw_value}') but explicit tax inclusion statement ('incl. of all taxes') was not verified."
                    }
            except Exception:
                pass

        return {
            "rule_id": rule_id,
            "rule_version": rule_version,
            "field_name": target_field_name,
            "applicable": True,
            "result": "COMPLIANT",
            "severity": severity,
            "detected_value": matching_field.raw_value,
            "reason": f"Required declaration detected with sufficient OCR evidence ({conf_percentage}% confidence)."
        }

compliance_engine = ComplianceEngine()
