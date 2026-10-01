import json
import os
import re
from typing import List, Dict, Any, Optional
import httpx
from app.schemas.regulatory import RegulatorySectionResponse, RegulatoryQueryResponse, ChatMessage

PRELIMINARY_SCREENING_DISCLAIMER = (
    "DISCLAIMER: This analysis is a preliminary automated screening based on Legal Metrology "
    "(Packaged Commodities) Rules, 2011 and Legal Metrology Act, 2009. It does NOT constitute a final "
    "legal compliance determination or official enforcement order. Manual verification by an authorized "
    "Legal Metrology Inspector is required."
)

class RegulatoryService:
    def __init__(self, data_path: str = None):
        if data_path is None:
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

    def _score_sections(self, query: str) -> List[RegulatorySectionResponse]:
        query_words = set(re.findall(r'\w+', query.lower()))
        scored_sections = []

        for section in self.sections:
            score = 0.0
            keywords = [k.lower() for k in section.get("keywords", [])]
            title = section.get("title", "").lower()
            text = section.get("text", "").lower()
            section_num = section.get("section_number", "").lower()

            for word in query_words:
                if len(word) < 3:
                    continue
                if word in section_num:
                    score += 3.5
                if any(word in kw for kw in keywords):
                    score += 2.5
                if word in title:
                    score += 1.8
                if word in text:
                    score += 0.8

            # Concept matches
            q_lower = query.lower()
            if any(term in q_lower for term in ["mrp", "price", "cost", "charge", "rupee", "tax"]) and "mrp" in section.get("id", "").lower():
                score += 3.0
            if any(term in q_lower for term in ["qty", "quantity", "weight", "gram", "kg", "volume", "liter", "ml"]) and "rule-6-1-c" in section.get("id", "").lower():
                score += 3.0
            if any(term in q_lower for term in ["date", "mfg", "manufactur", "expiry", "best before", "shelf"]) and "rule-6-1-d" in section.get("id", "").lower():
                score += 3.0
            if any(term in q_lower for term in ["care", "customer", "contact", "phone", "email", "helpline", "complaint"]) and "rule-6-1-f" in section.get("id", "").lower():
                score += 3.0
            if any(term in q_lower for term in ["origin", "imported", "country", "import", "foreign"]) and "rule-6-10" in section.get("id", "").lower():
                score += 3.0
            if any(term in q_lower for term in ["font", "size", "height", "numeral", "millimeter", "mm"]) and "rule-8" in section.get("id", "").lower():
                score += 3.0
            if any(term in q_lower for term in ["penalty", "fine", "jail", "punish", "imprisonment", "offense", "violation"]) and "sec-36" in section.get("id", "").lower():
                score += 3.0
            if any(term in q_lower for term in ["dual", "overcharge", "higher price"]) and "rule-18-2" in section.get("id", "").lower():
                score += 3.0
            if any(term in q_lower for term in ["online", "ecommerce", "e-commerce", "amazon", "flipkart"]) and "ecomm" in section.get("id", "").lower():
                score += 3.0
            if any(term in q_lower for term in ["exempt", "sample", "small pack", "10g", "10ml"]) and "rule-26" in section.get("id", "").lower():
                score += 3.0
            if any(term in q_lower for term in ["company", "director", "manager", "liable", "partner"]) and "sec-39" in section.get("id", "").lower():
                score += 3.0

            if score > 0:
                normalized_score = min(1.0, round(score / 6.0, 2))
                scored_sections.append((normalized_score, section))

        scored_sections.sort(key=lambda x: x[0], reverse=True)

        top_matches = []
        for rel_score, sec in scored_sections[:4]:
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
        return top_matches

    def _try_external_llm(self, query: str, context_sections: List[RegulatorySectionResponse]) -> Optional[str]:
        """Optionally invoke Gemini or OpenAI if API keys are configured in environment."""
        gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        openai_key = os.environ.get("OPENAI_API_KEY")

        context_str = "\n\n".join([
            f"[{s.act_or_rule} - {s.section_number}: {s.title}]\n{s.text}"
            for s in context_sections
        ])

        system_instruction = (
            "You are the official SmartPack AI Regulatory Assistant specializing in Indian Legal Metrology Act, 2009 "
            "and Legal Metrology (Packaged Commodities) Rules, 2011. "
            "Always answer the user's specific question directly in the very first sentence (e.g. Yes/No/Here is how). "
            "Explain the rules conversationally and clearly. Provide practical advice, checklist items, and mention statutory penalties where relevant. "
            "Never just quote raw rule texts without answering the question. Format your response cleanly using markdown headings and bullet points."
        )

        if gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": f"{system_instruction}\n\nStatutory Context:\n{context_str}\n\nUser Question:\n{query}"
                        }]
                    }],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 800}
                }
                with httpx.Client(timeout=8.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts and "text" in parts[0]:
                                return parts[0]["text"].strip()
            except Exception:
                pass

        if openai_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": f"Context:\n{context_str}\n\nUser Question: {query}"}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 800
                }
                with httpx.Client(timeout=8.0) as client:
                    resp = client.post(url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        choices = data.get("choices", [])
                        if choices:
                            return choices[0].get("message", {}).get("content", "").strip()
            except Exception:
                pass

        return None

    def _synthesize_ai_response(self, query: str, top_matches: List[RegulatorySectionResponse]) -> Dict[str, Any]:
        """Synthesize a direct, natural, conversational answer tailored to the user's question."""
        q = query.strip().lower()

        # 1. Greetings & Bot Identity
        if re.search(r'^(hi|hello|hey|good\s+morning|good\s+afternoon|good\s+evening|greetings)\b', q) or q in ["who are you", "what can you do", "help", "who made you"]:
            answer = (
                "**Hello! I am your Legal Metrology & Packaging Compliance AI Assistant.** 🌿\n\n"
                "I am trained on the **Legal Metrology Act, 2009** and the **Legal Metrology (Packaged Commodities) Rules, 2011** "
                "to provide direct, authoritative answers to your packaging compliance questions.\n\n"
                "### How I can assist you:\n"
                "- **Mandatory Declarations:** Guidance on MRP, Net Quantity, Expiry/Mfg Dates, Manufacturer info, and Country of Origin.\n"
                "- **Compliance Verification:** Determine whether a package meets statutory font sizes, contrast, and layout norms.\n"
                "- **Statutory Penalties:** Understand fine amounts and legal consequences under Section 36 & Section 39.\n"
                "- **Digital & E-Commerce:** Clarify e-commerce marketplace display mandates and package exemptions.\n\n"
                "What would you like to verify today? Ask me any specific question or click one of the suggested prompts below!"
            )
            return {
                "answer": answer,
                "followups": [
                    "What are the mandatory declarations on pre-packaged goods?",
                    "Can a retailer charge more than MRP?",
                    "What is the penalty under Section 36 for non-compliance?"
                ]
            }

        # 2. MRP / Pricing / Dual MRP questions
        is_mrp = any(w in q for w in ["mrp", "price", "retail sale price", "pricing", "charge", "cost", "taxes"])
        is_dual_or_overcharge = any(w in q for w in ["dual", "higher", "more than", "extra", "overcharge", "different price"])
        is_can_sell_without = re.search(r'\b(can\s+(i|we|a\s+seller|retailer)|is\s+it\s+allowed|possible|permissible)\b', q) and any(w in q for w in ["without", "missing", "no", "omit"])
        is_missing_what_happens = any(w in q for w in ["what happens", "what if", "if missing", "not printed", "absent", "without"])

        if is_mrp:
            if is_dual_or_overcharge:
                answer = (
                    "**No, retailers and distributors are strictly prohibited from charging more than the printed MRP or displaying dual MRPs.**\n\n"
                    "### Key Legal Rules:\n"
                    "- **Rule 18(2) Prohibition:** No person or retailer can declare different MRPs on identical pre-packaged goods, nor can they sell at a price higher than the declared Maximum Retail Price.\n"
                    "- **Inclusive of All Taxes:** Under **Rule 6(1)(e)**, the MRP is all-inclusive. Adding extra GST, service charges, or refrigeration fees over the printed MRP is illegal.\n\n"
                    "### Penalties for Overcharging / Dual MRP:\n"
                    "- Charging above MRP or affixing unauthorized higher price stickers constitutes a punishable offense under **Section 36** with fines up to **₹25,000** for first offenses and up to **₹50,000 / 1 year imprisonment** for repeat offenses."
                )
                followups = [
                    "What is the penalty under Section 36?",
                    "Can restaurants charge extra for packaged water bottles?",
                    "What is the minimum font size for MRP numerals?"
                ]
                return {"answer": answer, "followups": followups}

            elif is_can_sell_without or is_missing_what_happens:
                answer = (
                    "**No, you cannot legally sell any pre-packaged commodity in India without a clearly declared Maximum Retail Price (MRP).**\n\n"
                    "### Why It Is Prohibited:\n"
                    "- **Statutory Mandate (Rule 6(1)(e)):** Every retail package must state the retail sale price in Indian Rupees as `Maximum Retail Price (MRP) Rs. XX.XX` or `₹ XX.XX (inclusive of all taxes)`.\n"
                    "- **Section 18 Violation:** Section 18 of the Legal Metrology Act, 2009 strictly prohibits manufacturing, packing, selling, or distributing any pre-packaged commodity lacking mandatory declarations.\n\n"
                    "### Consequences of Missing MRP:\n"
                    "- **Seizure & Notice:** Legal Metrology inspectors can immediately issue compounding notices and seize non-compliant stock.\n"
                    "- **Statutory Fines:** Under **Section 36**, the first offense incurs a fine up to **₹25,000**, the second up to **₹50,000**, and subsequent offenses may lead to **₹1,00,000 fine or up to 1 year imprisonment**.\n\n"
                    "### Recommended Action:\n"
                    "Ensure every retail pack displays `MRP ₹ [Price] (incl. of all taxes)` prominently on the principal display panel with high contrast against the background."
                )
                followups = [
                    "What font size is required for MRP declarations?",
                    "Can e-commerce sites sell without showing MRP?",
                    "What are the mandatory declarations besides MRP?"
                ]
                return {"answer": answer, "followups": followups}

            else:
                answer = (
                    "**Under Indian Legal Metrology Rules, the Maximum Retail Price (MRP) must be clearly stated on every pre-packaged commodity.**\n\n"
                    "### Mandatory MRP Format Guidelines:\n"
                    "- **Syntax:** Must be printed as `MRP Rs. XX.XX (inclusive of all taxes)` or `MRP ₹ XX.XX (incl. of all taxes)`.\n"
                    "- **All-Inclusive:** The declared MRP must include all central and state taxes (GST, cess, duties). No additional taxes can be levied at the billing counter.\n"
                    "- **Unit Sale Price (USP):** For packages containing more than 1 kg or 1 L, the Unit Sale Price per gram/ml or per kg/L must also be declared alongside the MRP.\n"
                    "- **Font Size (Rule 8):** Numeral height must comply with packaging volume (minimum 1.0mm for ≤50g up to 6.0mm for >1kg).\n\n"
                    "Selling above MRP or without an MRP is punishable under Section 36."
                )
                followups = [
                    "What is the rule for Unit Sale Price (USP)?",
                    "What is the penalty for selling above MRP?",
                    "Is dual MRP allowed in airports or malls?"
                ]
                return {"answer": answer, "followups": followups}

        # 3. Net Quantity / Weight / Volume / Units questions
        is_qty = any(w in q for w in ["net quantity", "net weight", "net content", "weight", "volume", "grams", "kilogram", "liters", "milliliters", "unit"])
        if is_qty:
            answer = (
                "**Net quantity must be declared using standard metric units in accordance with Rule 6(1)(c) of the Legal Metrology (Packaged Commodities) Rules, 2011.**\n\n"
                "### Permitted Metric Units & Symbols:\n"
                "- **Solid Commodities:** Must be stated in grams (`g`) or kilograms (`kg`). Quantities under 1,000 g must be written in `g`; 1,000 g and above must be in `kg`.\n"
                "- **Liquid Commodities:** Must be stated in milliliters (`ml`) or liters (`l` or `L`). Below 1,000 ml use `ml`; 1,000 ml and above use `l` or `L`.\n"
                "- **By Number/Count:** Expressed as numbers (`N` or `U`).\n\n"
                "### Crucial Compliance Rules:\n"
                "- ⚠️ **Prohibited Abbreviations:** Non-standard abbreviations such as `gms`, `gm`, `kgs`, `lit`, or `ml.` are strictly **non-compliant**. Only official symbols (`g`, `kg`, `ml`, `l`) are accepted.\n"
                "- **Space Separation:** A clear space must be maintained between the numeric value and the unit (e.g. `500 g`, not `500g`).\n"
                "- **Minimum Numeral Height (Rule 8):**\n"
                "  - Up to 50 g/ml: Minimum **1.0 mm** (2.0 mm if blown/molded)\n"
                "  - 50 g to 200 g/ml: Minimum **2.0 mm**\n"
                "  - 200 g to 1 kg/L: Minimum **4.0 mm**\n"
                "  - Above 1 kg/L: Minimum **6.0 mm**"
            )
            followups = [
                "What is the penalty for non-standard abbreviations like 'gms'?",
                "What font size is required for net quantity?",
                "What are the exemptions for small packages under 10 grams?"
            ]
            return {"answer": answer, "followups": followups}

        # 4. Date of Manufacture / Expiry / Best Before / Shelf Life
        is_date = any(w in q for w in ["manufacture", "mfg", "packing date", "packed date", "expiry", "best before", "shelf life", "use by"])
        if is_date:
            answer = (
                "**Under Rule 6(1)(d), every pre-packaged commodity must display the month and year of manufacture, packing, or import.**\n\n"
                "### Prescribed Formatting:\n"
                "- **Standard Date Format:** Must be declared as `MM/YYYY` (e.g. `09/2026`) or `Month and Year` (e.g. `Sept 2026`).\n"
                "- **Pre-printed Labels:** If pre-printed, the letters must be clearly legible and not smudged.\n"
                "- **Best Before / Expiry:** For food items and commodities with limited shelf life, the 'Best Before' or 'Use By' period must be declared in conjunction with the manufacturing/packing date.\n\n"
                "### What Happens If Date Is Missing or Obscured?\n"
                "- Selling packages without a valid manufacturing or packing date violates Section 18 and incurs penalties under Section 36 (fines up to ₹25,000 for first violation)."
            )
            followups = [
                "Can a package show 'Best Before 6 Months from Mfg'?",
                "What are the mandatory declarations for imported packages?",
                "What is the penalty for selling expired packages?"
            ]
            return {"answer": answer, "followups": followups}

        # 5. Manufacturer / Packer / Importer Name & Address
        is_mfg_info = any(w in q for w in ["manufacturer", "packer", "importer", "address", "premises", "office"])
        if is_mfg_info:
            answer = (
                "**Under Rule 6(1)(a), every package must prominently declare the complete legal identity and address of the manufacturer, packer, or importer.**\n\n"
                "### Mandatory Details to Include:\n"
                "1. **Name:** Full registered business name or corporate entity.\n"
                "2. **Complete Address:** Full physical address including premises number, street, city, state, and PIN code.\n"
                "3. **Dual Roles:** Where the manufacturer is distinct from the packer, the names and addresses of both the manufacturer and the packer must be declared (e.g., `Manufactured by X for Packed & Marketed by Y`).\n"
                "4. **Imported Goods:** For imported items, the full registered name and Indian address of the importer must be declared."
            )
            followups = [
                "Is email or website alone sufficient for manufacturer address?",
                "What are the rules for imported packages?",
                "What are the consumer care requirements under Rule 6(1)(f)?"
            ]
            return {"answer": answer, "followups": followups}

        # 6. Consumer Care / Customer Support
        is_consumer_care = any(w in q for w in ["consumer care", "customer care", "customer support", "helpline", "complaint", "grievance", "toll free", "toll-free"])
        if is_consumer_care:
            answer = (
                "**Under Rule 6(1)(f), every pre-packaged commodity must display complete consumer grievance redressal contact details.**\n\n"
                "### Mandatory Consumer Care Elements:\n"
                "1. **Designation / Official:** Name or office designation (e.g. *Manager - Consumer Care* or *Customer Service Cell*).\n"
                "2. **Postal Address:** Complete postal address where consumer complaints can be mailed.\n"
                "3. **Telephone / Helpline:** Working telephone number or toll-free helpline.\n"
                "4. **Email Address:** Active email address for consumer grievances.\n\n"
                "Omitting consumer care contact details is a statutory violation under Section 18 of the Legal Metrology Act, 2009."
            )
            followups = [
                "What if a company only provides a website link for consumer care?",
                "What is the penalty for missing consumer care details?",
                "What are the mandatory declarations on pre-packaged goods?"
            ]
            return {"answer": answer, "followups": followups}

        # 7. Country of Origin / Imported Goods
        is_origin = any(w in q for w in ["country of origin", "origin", "imported", "import", "made in", "china", "customs", "foreign"])
        if is_origin:
            answer = (
                "**Yes, declaring the Country of Origin is mandatory on all pre-packaged commodities sold in India, under Rule 6(10) of the Packaged Commodities Rules, 2011.**\n\n"
                "### Regulatory Mandates for Origin:\n"
                "- **Imported Goods:** The label must explicitly state the country of manufacture or assembly (e.g. `Country of Origin: Vietnam` or `Made in Germany`).\n"
                "- **Indian Products:** Domestic packages should clearly indicate `Country of Origin: India` or `Made in India`.\n"
                "- **E-Commerce Listings:** Digital marketplaces (Amazon, Flipkart, etc.) must display the Country of Origin on the product listing page before purchase.\n"
                "- **Customs Clearance:** Packages without origin declarations are liable to detention by customs authorities."
            )
            followups = [
                "What other declarations are mandatory for imported packages?",
                "Can an e-commerce platform be fined for missing country of origin?",
                "What is the penalty under Section 36?"
            ]
            return {"answer": answer, "followups": followups}

        # 8. Font Size / Numeral Height / Contrast / Rule 8 & 9
        is_font = any(w in q for w in ["font", "size", "height", "numeral", "letter", "contrast", "visibility", "legib", "prominent"])
        if is_font:
            answer = (
                "**Rule 8 and Rule 9 of the Packaged Commodities Rules, 2011 prescribe exact minimum font heights and legibility standards based on net package content.**\n\n"
                "### Minimum Numeral Height Table (Rule 8):\n"
                "- **Up to 50 g / 50 ml:** Minimum **1.0 mm** (2.0 mm if blown/molded/embossed)\n"
                "- **50 g to 200 g / ml:** Minimum **2.0 mm** (4.0 mm if blown/molded)\n"
                "- **200 g to 1 kg / L:** Minimum **4.0 mm** (6.0 mm if blown/molded)\n"
                "- **Above 1 kg / 1 L:** Minimum **6.0 mm** (6.0 mm if blown/molded)\n\n"
                "### Contrast & Placement (Rule 9):\n"
                "- Declarations must have sharp color contrast with the packaging background.\n"
                "- Must be definite, plain, and placed on the **Principal Display Panel (PDP)**."
            )
            followups = [
                "What is the Principal Display Panel (PDP)?",
                "What font size is needed for a 500g biscuit pack?",
                "What is the penalty if font size is too small?"
            ]
            return {"answer": answer, "followups": followups}

        # 9. Penalties / Section 36 / Section 39 / Fines / Imprisonment
        is_penalty = any(w in q for w in ["penalty", "penalties", "fine", "fines", "section 36", "section 39", "jail", "imprisonment", "punish", "offense", "court"])
        if is_penalty:
            answer = (
                "**Under Section 36 of the Legal Metrology Act, 2009, selling or distributing non-compliant packages carries severe monetary fines and potential imprisonment.**\n\n"
                "### Statutory Penalty Breakdown (Section 36):\n"
                "- **First Offense:** Monetary fine extending up to **₹25,000**.\n"
                "- **Second Offense:** Monetary fine extending up to **₹50,000**.\n"
                "- **Subsequent Offenses:** Fine up to **₹1,00,000** or **imprisonment for up to one year**, or both.\n\n"
                "### Corporate & Director Liability (Section 39):\n"
                "- When a company violates the Act, the company and its nominated director/manager in charge of packaging operations are held personally liable and subject to prosecution."
            )
            followups = [
                "Can offenses under Legal Metrology be compounded?",
                "What triggers Section 36 penalties?",
                "Who is liable if a company violates packaging rules?"
            ]
            return {"answer": answer, "followups": followups}

        # 10. E-Commerce / Online Selling
        is_ecomm = any(w in q for w in ["ecommerce", "e-commerce", "online", "marketplace", "amazon", "flipkart", "website"])
        if is_ecomm:
            answer = (
                "**Under Rule 6(10) & E-Commerce Amendments, all digital marketplaces and online sellers must display mandatory declarations directly on the product display page.**\n\n"
                "### Mandatory Online Declarations Before Purchase:\n"
                "1. **Maximum Retail Price (MRP)** and Unit Sale Price (USP).\n"
                "2. **Net Quantity** in metric units.\n"
                "3. **Country of Origin**.\n"
                "4. **Manufacturer / Importer Identity & Address**.\n"
                "5. **Best Before / Expiry Date** (or shelf life).\n"
                "6. **Consumer Care Details**.\n\n"
                "Non-compliance makes both the seller and the e-commerce entity liable to regulatory penalties."
            )
            followups = [
                "What is the penalty for e-commerce platforms missing declarations?",
                "What is Unit Sale Price (USP)?",
                "What are the country of origin rules?"
            ]
            return {"answer": answer, "followups": followups}

        # 11. Small Package Exemptions (Rule 26)
        is_exempt = any(w in q for w in ["exempt", "sample", "small package", "hotel", "restaurant", "10g", "10ml", "wholesale"])
        if is_exempt:
            answer = (
                "**Under Rule 26 of the Legal Metrology (Packaged Commodities) Rules, 2011, specific package categories are exempt from mandatory label declarations.**\n\n"
                "### Statutory Exemptions:\n"
                "- **Tiny Packages:** Packages containing food articles or commodities of net weight/measure of **10 grams or 10 milliliters or less**.\n"
                "- **Hospitality & Catering:** Fast food items packed by hotels or restaurants for immediate consumption.\n"
                "- **Bulk Agricultural Produce:** Packages containing agricultural produce exceeding 50 kg."
            )
            followups = [
                "Do perfume sample vials under 10ml need MRP?",
                "What declarations are mandatory for packages over 10g?",
                "What is the penalty under Section 36?"
            ]
            return {"answer": answer, "followups": followups}

        # 12. General Synthesized Grounded Answer
        if top_matches:
            primary = top_matches[0]
            answer = (
                f"**Regarding your question, the applicable statutory guidance is governed by {primary.act_or_rule}, {primary.section_number} ('{primary.title}').**\n\n"
                f"### Core Legal Requirement:\n"
                f"{primary.summary}\n\n"
                f"### Statutory Text Provision:\n"
                f"> \"{primary.text}\"\n\n"
                f"### Practical Compliance Guidance:\n"
                f"- Ensure this requirement is visibly fulfilled on the principal display panel.\n"
                f"- Maintain compliance with font height (Rule 8) and color contrast (Rule 9).\n"
                f"- Any failure to comply constitutes a non-standard package violation punishable under Section 36 with fines up to ₹25,000 for the first offense."
            )
            followups = [
                "What is the penalty for non-compliance under Section 36?",
                "What are the font size requirements under Rule 8?",
                "What are the mandatory declarations on pre-packaged goods?"
            ]
            return {"answer": answer, "followups": followups}

        # Fallback
        answer = (
            "**I could not find an exact statutory match for your query in the Legal Metrology rules.**\n\n"
            "As your Legal Metrology AI Assistant, I can answer questions about:\n"
            "- **MRP & Pricing** (Rule 6(1)(e), dual MRP prohibition)\n"
            "- **Net Quantity & Metric Units** (Rule 6(1)(c), permissible units `g`, `kg`, `ml`, `l`)\n"
            "- **Manufacturing & Expiry Dates** (Rule 6(1)(d))\n"
            "- **Manufacturer / Packer / Importer Details** (Rule 6(1)(a))\n"
            "- **Consumer Care Helpline & Redressal** (Rule 6(1)(f))\n"
            "- **Country of Origin Mandates** (Rule 6(10))\n"
            "- **Penalties & Legal Prosecution** (Section 36 & Section 39)"
        )
        return {
            "answer": answer,
            "followups": [
                "What are the mandatory declarations on pre-packaged goods?",
                "Can I sell a product without MRP?",
                "What is the penalty under Section 36?"
            ]
        }

    def query_regulatory_assistant(self, query: str, history: Optional[List[Any]] = None) -> RegulatoryQueryResponse:
        top_matches = self._score_sections(query)

        # Attempt external LLM if API key exists
        llm_answer = self._try_external_llm(query, top_matches)
        if llm_answer:
            followups = [
                "What is the penalty for non-compliance under Section 36?",
                "What font size is required under Rule 8?",
                "What are the mandatory declarations on pre-packaged goods?"
            ]
            return RegulatoryQueryResponse(
                query=query,
                answer=llm_answer,
                matched_sections=top_matches,
                disclaimer=PRELIMINARY_SCREENING_DISCLAIMER,
                suggested_followups=followups
            )

        # Use our built-in intelligent reasoning engine
        synthesis = self._synthesize_ai_response(query, top_matches)
        return RegulatoryQueryResponse(
            query=query,
            answer=synthesis["answer"],
            matched_sections=top_matches,
            disclaimer=PRELIMINARY_SCREENING_DISCLAIMER,
            suggested_followups=synthesis.get("followups", [])
        )

regulatory_service = RegulatoryService()

