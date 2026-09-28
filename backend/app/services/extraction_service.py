import re
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.inspection import Inspection
from app.models.extracted_field import ExtractedField
from app.models.evidence import Evidence
from app.services.ocr_service import ocr_service

class FieldExtractor:
    @staticmethod
    def calculate_confidence(ocr_conf: float, pattern_conf: float, context_conf: float) -> float:
        """
        Documented deterministic formula for extraction confidence:
        final_confidence = 0.50 * ocr_confidence + 0.30 * pattern_confidence + 0.20 * context_confidence
        """
        final_conf = 0.50 * ocr_conf + 0.30 * pattern_conf + 0.20 * context_conf
        return round(min(max(final_conf, 0.0), 1.0), 4)

    @staticmethod
    def extract_mrp(text: str) -> Optional[Dict[str, Any]]:
        """Extracts and normalizes Maximum Retail Price (MRP)."""
        patterns = [
            r'(?:MRP|M\.R\.P\.?|MAXIMUM RETAIL PRICE)\s*[:\.]?\s*₹?\s*(?:RS\.?|INR)?\s*(\d+(?:\.\d{1,2})?)(?:\s*/-|\s*/-)?',
            r'₹\s*(\d+(?:\.\d{1,2})?)(?:\s*/-)?',
            r'(?:RS\.?|INR)\s*(\d+(?:\.\d{1,2})?)(?:\s*/-)?',
            r'(\d+(?:\.\d{1,2})?)\s*/-'
        ]
        
        for pat in patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                try:
                    val = float(match.group(1))
                    has_tax = bool(re.search(r'INCLUSIV[A-Z]*\s*(?:OF)?\s*ALL\s*TAXES|INCL\.?\s*(?:OF)?\s*ALL\s*TAXES', text, re.IGNORECASE))
                    return {
                        "value": val,
                        "currency": "INR",
                        "tax_inclusive": has_tax,
                        "raw": match.group(0)
                    }
                except ValueError:
                    continue
        return None

    @staticmethod
    def extract_net_quantity(text: str) -> Optional[Dict[str, Any]]:
        """Extracts and normalizes Net Quantity (g, kg, mg, ml, L, Litre, Litres)."""
        pattern = r'(?:NET\s*(?:WT|VOL|QTY|QUANTITY)?(?:\s*AT\s*\d+°?\s*C)?\s*[:\.]?\s*)?(\d+(?:\.\d+)?)\s*(KG|KGS|KILOGRAMS?|G|GM|GMS|GRAMS?|MG|ML|MILLILITERS?|LITRES?|LITERS?|L|CL)\b'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                val = float(match.group(1))
                unit_raw = match.group(2).upper()
                
                unit_map = {
                    "KGS": "kg", "KILOGRAM": "kg", "KILOGRAMS": "kg", "KG": "kg",
                    "G": "g", "GM": "g", "GMS": "g", "GRAM": "g", "GRAMS": "g",
                    "MG": "mg",
                    "ML": "ml", "MILLILITER": "ml", "MILLILITERS": "ml",
                    "L": "L", "LITRE": "L", "LITRES": "L", "LITER": "L", "LITERS": "L",
                    "CL": "cl"
                }
                norm_unit = unit_map.get(unit_raw, unit_raw)

                return {
                    "value": val,
                    "unit": unit_raw,
                    "normalized_value": val,
                    "normalized_unit": norm_unit,
                    "raw": match.group(0)
                }
            except ValueError:
                pass
        return None

    @staticmethod
    def extract_dates(text: str) -> List[Dict[str, Any]]:
        """Extracts and normalizes Manufacturing / Packing / Expiry dates."""
        results = []
        date_pattern = r'(\d{1,2}[/\-\.\s]+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[a-z]*[,\s]+\d{4}|\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[a-z]*[,\s]+\d{1,2}[,\s]+\d{4}|\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[a-z]*[,\s]+\d{4}|\d{2}[/\-\.]\d{2}[/\-\.]\d{4}|\d{2}[/\-\.]\d{4}|\d{2}[/\-\.]\d{2})'
        
        lines = text.split('\n')
        for line in lines:
            mfg_match = re.search(r'(?:MFG|MFD|MANUFACTURED|PKD|PACKED|PACKED ON|DATE OF PKG|DATE OF MFG)\s*[:\.]?\s*' + date_pattern, line, re.IGNORECASE)
            if mfg_match:
                results.append({
                    "date_type": "manufacturing_date",
                    "raw_value": mfg_match.group(1),
                    "normalized_value": mfg_match.group(1).replace('.', '-').replace('/', '-'),
                    "raw": mfg_match.group(0)
                })

            exp_match = re.search(r'(?:EXP|EXPIRY|BEST BEFORE|USE BY)\s*[:\.]?\s*' + date_pattern, line, re.IGNORECASE)
            if exp_match:
                results.append({
                    "date_type": "expiry_date",
                    "raw_value": exp_match.group(1),
                    "normalized_value": exp_match.group(1).replace('.', '-').replace('/', '-'),
                    "raw": exp_match.group(0)
                })

        return results

    @staticmethod
    def extract_manufacturer(text: str) -> Optional[Dict[str, Any]]:
        """Extracts Manufacturer / Packer / Importer name and details."""
        pattern = r'(?:MFD\.?\s*BY|MANUFACTURED\s*(?:AND\s*PACKED)?\s*(?:BY|AT)|PACKED\s+(?:BY|AT)|MKTD\.?\s*BY|MARKETED\s*BY|IMPORTED\s*BY)\s*[:\.]?\s*([A-Za-z0-9\s,\.\-&]+)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            entity_text = match.group(1).strip()
            entity_text = re.split(r'(?:NET|MRP|BATCH|EXP|MFG|INGREDIENTS|FOR CONSUMER)', entity_text, flags=re.IGNORECASE)[0].strip()
            if entity_text:
                return {
                    "entity_name": entity_text[:150],
                    "raw": match.group(0)
                }
        return None

    @staticmethod
    def extract_consumer_care(text: str) -> Optional[Dict[str, Any]]:
        """Extracts Consumer Care helpline, phone, email, or feedback info."""
        pattern = r'(?:FOR\s*CONSUMER\s*(?:FEEDBACK|CARE|COMPLAINTS)|CONSUMER\s*(?:CARE|FEEDBACK|COMPLAINTS)|CUSTOMER\s*CARE|HELPLINE|TOLL\s*FREE|CONTACT\s*US\s*AT)\s*(?:,?\s*PLEASE\s*CONTACT\s*US\s*AT)?\s*[:\.]?\s*([A-Za-z0-9\s,\.@\-\+]+)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            info = match.group(1).strip()
            email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
            phone_match = re.search(r'(?:\+91|1800|0)?\d{10,11}', text)
            
            return {
                "info": info[:150],
                "email": email_match.group(0) if email_match else None,
                "phone": phone_match.group(0) if phone_match else None,
                "raw": match.group(0)
            }
        return None

    @staticmethod
    def extract_country_of_origin(text: str) -> Optional[Dict[str, Any]]:
        """Extracts Country of Origin."""
        pattern = r'(?:MADE\s*IN|COUNTRY\s*OF\s*ORIGIN|PRODUCT\s*OF)\s*[:\.]?\s*([A-Za-z]+)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return {
                "country": match.group(1).strip().capitalize(),
                "raw": match.group(0)
            }
        return None

class ExtractionService:
    @staticmethod
    def process_inspection_extraction(db: Session, inspection_id: str) -> List[ExtractedField]:
        """
        Executes field extraction pipeline on inspection OCR text items
        and persists ExtractedField records in the database.
        """
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise ValueError(f"Inspection session {inspection_id} not found")

        inspection.status = "EXTRACTING"
        db.commit()

        # Delete previous extracted fields & evidence for this inspection session
        db.query(Evidence).filter(Evidence.inspection_id == inspection_id).delete()
        db.query(ExtractedField).filter(ExtractedField.inspection_id == inspection_id).delete()
        db.commit()

        # Fetch OCR items from OCRService
        ocr_data = ocr_service.process_inspection_ocr(db, inspection_id)
        ocr_items = ocr_data.get("items", [])

        # Combine all OCR text lines with associated item references
        full_text = "\n".join([item["text"] for item in ocr_items])
        
        extracted_db_records: List[ExtractedField] = []

        # 1. Product Name (from session or OCR first line)
        prod_name = inspection.product_name or (ocr_items[0]["text"] if ocr_items else "Packaged Commodity")
        f_name = ExtractedField(
            inspection_id=inspection_id,
            field_name="product_name",
            raw_value=prod_name,
            normalized_value=json.dumps({"name": prod_name}),
            confidence=0.95,
            status="DETECTED"
        )
        db.add(f_name)
        extracted_db_records.append(f_name)

        # Helper to find matching OCR item for evidence
        def find_ocr_item_for_text(raw_snippet: str):
            for item in ocr_items:
                if raw_snippet.lower() in item["text"].lower() or item["text"].lower() in raw_snippet.lower():
                    return item
            return ocr_items[0] if ocr_items else None

        # 2. MRP Extraction
        mrp_data = FieldExtractor.extract_mrp(full_text)
        if mrp_data:
            matched_ocr = find_ocr_item_for_text(mrp_data["raw"])
            ocr_conf = matched_ocr["confidence"] if matched_ocr else 0.85
            final_conf = FieldExtractor.calculate_confidence(ocr_conf, 0.95, 0.90)
            
            f_mrp = ExtractedField(
                inspection_id=inspection_id,
                field_name="mrp",
                raw_value=mrp_data["raw"],
                normalized_value=json.dumps({"value": mrp_data["value"], "currency": mrp_data["currency"], "tax_inclusive": mrp_data["tax_inclusive"]}),
                confidence=final_conf,
                status="DETECTED"
            )
            db.add(f_mrp)
            extracted_db_records.append(f_mrp)

            # Store Evidence link
            if matched_ocr:
                ev = Evidence(
                    inspection_id=inspection_id,
                    image_id=matched_ocr["image_id"],
                    field_id=f_mrp.id,
                    source_text=matched_ocr["text"],
                    confidence=final_conf,
                    bbox_x=matched_ocr["bbox"][0],
                    bbox_y=matched_ocr["bbox"][1],
                    bbox_width=matched_ocr["bbox"][2] - matched_ocr["bbox"][0],
                    bbox_height=matched_ocr["bbox"][3] - matched_ocr["bbox"][1]
                )
                db.add(ev)

        # 3. Net Quantity Extraction
        nq_data = FieldExtractor.extract_net_quantity(full_text)
        if nq_data:
            matched_ocr = find_ocr_item_for_text(nq_data["raw"])
            ocr_conf = matched_ocr["confidence"] if matched_ocr else 0.85
            final_conf = FieldExtractor.calculate_confidence(ocr_conf, 0.95, 0.90)

            f_nq = ExtractedField(
                inspection_id=inspection_id,
                field_name="net_quantity",
                raw_value=nq_data["raw"],
                normalized_value=json.dumps({"value": nq_data["value"], "unit": nq_data["unit"]}),
                confidence=final_conf,
                status="DETECTED"
            )
            db.add(f_nq)
            extracted_db_records.append(f_nq)

            if matched_ocr:
                ev = Evidence(
                    inspection_id=inspection_id,
                    image_id=matched_ocr["image_id"],
                    field_id=f_nq.id,
                    source_text=matched_ocr["text"],
                    confidence=final_conf,
                    bbox_x=matched_ocr["bbox"][0],
                    bbox_y=matched_ocr["bbox"][1],
                    bbox_width=matched_ocr["bbox"][2] - matched_ocr["bbox"][0],
                    bbox_height=matched_ocr["bbox"][3] - matched_ocr["bbox"][1]
                )
                db.add(ev)

        # 4. Dates Extraction
        date_records = FieldExtractor.extract_dates(full_text)
        for d_rec in date_records:
            matched_ocr = find_ocr_item_for_text(d_rec["raw"])
            ocr_conf = matched_ocr["confidence"] if matched_ocr else 0.85
            final_conf = FieldExtractor.calculate_confidence(ocr_conf, 0.90, 0.85)

            f_date = ExtractedField(
                inspection_id=inspection_id,
                field_name=d_rec["date_type"],
                raw_value=d_rec["raw_value"],
                normalized_value=json.dumps({"date": d_rec["normalized_value"], "type": d_rec["date_type"]}),
                confidence=final_conf,
                status="DETECTED"
            )
            db.add(f_date)
            extracted_db_records.append(f_date)

            if matched_ocr:
                ev = Evidence(
                    inspection_id=inspection_id,
                    image_id=matched_ocr["image_id"],
                    field_id=f_date.id,
                    source_text=matched_ocr["text"],
                    confidence=final_conf,
                    bbox_x=matched_ocr["bbox"][0],
                    bbox_y=matched_ocr["bbox"][1],
                    bbox_width=matched_ocr["bbox"][2] - matched_ocr["bbox"][0],
                    bbox_height=matched_ocr["bbox"][3] - matched_ocr["bbox"][1]
                )
                db.add(ev)

        # 5. Manufacturer / Packer Extraction
        mfg_data = FieldExtractor.extract_manufacturer(full_text)
        if mfg_data:
            matched_ocr = find_ocr_item_for_text(mfg_data["raw"])
            ocr_conf = matched_ocr["confidence"] if matched_ocr else 0.85
            final_conf = FieldExtractor.calculate_confidence(ocr_conf, 0.85, 0.80)

            f_mfg = ExtractedField(
                inspection_id=inspection_id,
                field_name="manufacturer",
                raw_value=mfg_data["entity_name"],
                normalized_value=json.dumps({"name": mfg_data["entity_name"]}),
                confidence=final_conf,
                status="DETECTED"
            )
            db.add(f_mfg)
            extracted_db_records.append(f_mfg)

        # 6. Consumer Care Extraction
        cc_data = FieldExtractor.extract_consumer_care(full_text)
        if cc_data:
            matched_ocr = find_ocr_item_for_text(cc_data["raw"])
            ocr_conf = matched_ocr["confidence"] if matched_ocr else 0.85
            final_conf = FieldExtractor.calculate_confidence(ocr_conf, 0.85, 0.80)

            f_cc = ExtractedField(
                inspection_id=inspection_id,
                field_name="consumer_care",
                raw_value=cc_data["info"],
                normalized_value=json.dumps({"info": cc_data["info"], "phone": cc_data["phone"], "email": cc_data["email"]}),
                confidence=final_conf,
                status="DETECTED"
            )
            db.add(f_cc)
            extracted_db_records.append(f_cc)

        # 7. Country of Origin
        coo_data = FieldExtractor.extract_country_of_origin(full_text)
        if coo_data:
            matched_ocr = find_ocr_item_for_text(coo_data["raw"])
            ocr_conf = matched_ocr["confidence"] if matched_ocr else 0.85
            final_conf = FieldExtractor.calculate_confidence(ocr_conf, 0.90, 0.85)

            f_coo = ExtractedField(
                inspection_id=inspection_id,
                field_name="country_of_origin",
                raw_value=coo_data["country"],
                normalized_value=json.dumps({"country": coo_data["country"]}),
                confidence=final_conf,
                status="DETECTED"
            )
            db.add(f_coo)
            extracted_db_records.append(f_coo)

        db.commit()

        # Refresh all records
        for rec in extracted_db_records:
            db.refresh(rec)

        return extracted_db_records

extraction_service = ExtractionService()
