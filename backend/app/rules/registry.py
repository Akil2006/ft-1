import os
import json
from typing import List, Dict, Any, Optional

RULES_FILE_PATH = os.path.join(os.path.dirname(__file__), "legal_metrology_rules.json")

class RuleRegistry:
    def __init__(self):
        self._rules: Dict[str, Dict[str, Any]] = {}
        self.reload_rules()

    def reload_rules(self):
        """Loads and parses legal metrology rules from JSON file."""
        if os.path.exists(RULES_FILE_PATH):
            with open(RULES_FILE_PATH, "r", encoding="utf-8") as f:
                rules_list = json.load(f)
                self._rules = {r["rule_id"]: r for r in rules_list}

    def get_all_rules(self) -> List[Dict[str, Any]]:
        return list(self._rules.values())

    def get_rule_by_id(self, rule_id: str) -> Optional[Dict[str, Any]]:
        return self._rules.get(rule_id)

    def get_rules_for_field(self, field_name: str) -> List[Dict[str, Any]]:
        return [r for r in self._rules.values() if r.get("field") == field_name]

rule_registry = RuleRegistry()
