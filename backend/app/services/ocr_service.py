import os
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.inspection import Inspection
from app.models.image import InspectionImage
from app.services.ocr.ocr_manager import ocr_manager

class OCRService:
    @staticmethod
    def process_inspection_ocr(db: Session, inspection_id: str) -> Dict[str, Any]:
        """
        Executes OCR pipeline on all package images for an inspection session.
        Uses preprocessed images where available for optimal accuracy.
        """
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise ValueError(f"Inspection session {inspection_id} not found")

        inspection.status = "OCR_PROCESSING"
        db.commit()

        images = db.query(InspectionImage).filter(InspectionImage.inspection_id == inspection_id).all()
        all_ocr_items: List[Dict[str, Any]] = []
        engine_used = "none"

        for img in images:
            # Use preprocessed image path if available
            processed_file = os.path.join("./storage/processed", f"{img.id}_processed.png")
            target_path = processed_file if os.path.exists(processed_file) else img.storage_path

            if os.path.exists(target_path):
                items = ocr_manager.extract_text_from_image(target_path, img.id)
                if items:
                    engine_used = items[0]["engine"]
                    all_ocr_items.extend(items)

        return {
            "inspection_id": inspection_id,
            "total_text_blocks": len(all_ocr_items),
            "engine_used": engine_used if engine_used != "none" else ocr_manager.get_preferred_engine().name,
            "items": all_ocr_items
        }

ocr_service = OCRService()
