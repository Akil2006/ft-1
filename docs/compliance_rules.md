# Legal Metrology Compliance Rules Reference

All rules are defined in `backend/app/rules/legal_metrology_rules.json` based on the Legal Metrology (Packaged Commodities) Rules, 2011 and Amendments:

| Rule ID | Version | Field | Severity | Requirement Title & Legal Citation |
| :--- | :--- | :--- | :--- | :--- |
| `LM-NAME-001` | 2026.01 | `product_name` | HIGH | Common or Generic Commodity Name Declaration (Rule 6(1)(a)) |
| `LM-NQ-001` | 2026.01 | `net_quantity` | CRITICAL | Net Quantity Declaration (Rule 6(1)(b)) |
| `LM-DATE-001` | 2026.01 | `manufacturing_date` | HIGH | Month and Year of Manufacture / Packing (Rule 6(1)(d)) |
| `LM-MRP-001` | 2026.01 | `mrp` | CRITICAL | Maximum Retail Price (MRP) Declaration (Rule 6(1)(e)) |
| `LM-MFG-001` | 2026.01 | `manufacturer` | HIGH | Manufacturer / Packer / Importer Name & Address (Rule 6(1)(a)) |
| `LM-CC-001` | 2026.01 | `consumer_care` | HIGH | Consumer Care Details Declaration (Rule 6(2)) |
| `LM-COO-001` | 2026.01 | `country_of_origin` | MEDIUM | Country of Origin Declaration for Imported Commodities (Rule 6(1)(n)) |

---

## Result States & Meaning

1. **`COMPLIANT`**: Standard required declaration was detected on package label with high confidence (>= 75%) and valid formatting.
2. **`REVIEW_REQUIRED`**: Declaration detected but confidence is below threshold (< 75%), format is ambiguous, or legal applicability requires official human review.
3. **`MISSING_INFORMATION`**: Mandatory declaration could not be detected on package label.
4. **`NOT_APPLICABLE`**: Rule does not apply to the specific product category or type.
