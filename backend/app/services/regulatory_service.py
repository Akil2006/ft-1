import json
import os
import re
from typing import List, Dict, Any
from app.schemas.regulatory import RegulatorySectionResponse, RegulatoryQueryResponse

PRELIMINARY_SCREENING_DISCLAIMER = (
    "DISCLAIMER: This analysis is a preliminary automated screening based on Legal Metrology "
    "(Packaged Commodities) Rules, 2011 and Legal Metrology Act, 2009. It does NOT constitute a final "
    "legal compliance determination or official enforcement order. Manual verification by an authorized "
    "Legal Metrology Inspector is required."
)

class RegulatoryService:
    def __init__(self, data_path: str = None):
        if data_path is None:
            # Default relative to root
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
            data_path = os.path.join(base_dir, "data", "regulatory", "legal_metrology_act.json")
        self.data_path = data_path
        self.sections = self._load_data()

    def _load_data(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.data_path):
            return []
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def get_all_sections(self) -> List[Dict[str, Any]]:
        return self.sections

    def query_regulatory_assistant(self, query: str) -> RegulatoryQueryResponse:
        query_words = set(re.findall(r'\w+', query.lower()))
        scored_sections = []

        for section in self.sections:
            score = 0.0
            # Match keywords
            keywords = [k.lower() for k in section.get("keywords", [])]
            title = section.get("title", "").lower()
            text = section.get("text", "").lower()
            section_num = section.get("section_number", "").lower()

            for word in query_words:
                if len(word) < 3:
                    continue
                if word in section_num:
                    score += 3.0
                if any(word in kw for kw in keywords):
                    score += 2.0
                if word in title:
                    score += 1.5
                if word in text:
                    score += 0.5

            if score > 0:
                normalized_score = min(1.0, round(score / 5.0, 2))
                scored_sections.append((normalized_score, section))

        # Sort by score descending
        scored_sections.sort(key=lambda x: x[0], reverse=True)

        top_matches = []
        for rel_score, sec in scored_sections[:5]:
            top_matches.append(
                RegulatorySectionResponse(
                    id=sec["id"],
                    act_or_rule=sec["act_or_rule"],
                    section_number=sec["section_number"],
                    title=sec["title"],
                    text=sec["text"],
                    summary=sec["summary"],
                    relevance_score=rel_score
                )
            )

        # Synthesize answer grounded in retrieved provisions
        if not top_matches:
            answer = (
                "No specific Legal Metrology provisions found matching your query keywords. "
                "Please query about MRP, Net Quantity, Country of Origin, Consumer Care, Manufacturing Date, or Penalties."
            )
        else:
            primary_match = top_matches[0]
            answer = (
                f"Based on {primary_match.act_or_rule}, {primary_match.section_number} ('{primary_match.title}'): "
                f"{primary_match.summary} {primary_match.text}"
            )
            if len(top_matches) > 1:
                sec_refs = ", ".join([f"{m.section_number}" for m in top_matches[1:]])
                answer += f" Additional relevant provisions include: {sec_refs}."

        return RegulatoryQueryResponse(
            query=query,
            answer=answer,
            matched_sections=top_matches,
            disclaimer=PRELIMINARY_SCREENING_DISCLAIMER
        )

regulatory_service = RegulatoryService()
