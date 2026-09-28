from typing import Dict, Any, Tuple, Union

class RuleApplicabilityEngine:
    @staticmethod
    def evaluate_applicability(rule: Dict[str, Any], inspection_meta: Dict[str, Any]) -> Tuple[Union[bool, str], str]:
        """
        Evaluates contextual applicability of a legal metrology rule.
        Returns tuple: (applicable_status [True, False, "REVIEW"], explanation_reason)
        """
        app_spec = rule.get("applicability", {})
        categories = app_spec.get("categories", ["all"])
        
        # Rule applies to all commodities
        if "all" in categories:
            return True, f"Applicable: Mandatory requirement for all prepackaged commodities under {rule.get('source_section', 'Legal Metrology Rules')}."

        prod_category = (inspection_meta.get("category") or "").lower()
        pkg_type = (inspection_meta.get("package_type") or "").lower()

        # Imported commodity rule check (e.g., LM-COO-001)
        if "imported" in categories:
            if "imported" in prod_category or "import" in pkg_type:
                return True, "Applicable: Mandatory Country of Origin declaration for imported commodities."
            elif prod_category and "imported" not in prod_category:
                return False, "Not Applicable: Country of origin rule applies specifically to imported packaged commodities."
            else:
                return "REVIEW", "Applicability Uncertain: Commodity origin is ambiguous; official human review required to confirm if product is imported."

        return True, "Applicable: Rule matches commodity inspection criteria."

applicability_engine = RuleApplicabilityEngine()
