import os
import cv2
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.models.inspection import Inspection
from app.models.image import InspectionImage
from app.models.extracted_field import ExtractedField
from app.models.evidence import Evidence

class EvidenceService:
    @staticmethod
    def generate_roi_crop(image_path: str, bbox: List[float], evidence_id: str) -> Optional[str]:
        """
        Crops Region of Interest (ROI) from image corresponding to bounding box coordinates
        and saves cropped snippet in storage/evidence/.
        """
        if not image_path or not os.path.exists(image_path) or not bbox or len(bbox) < 4:
            return None

        os.makedirs(settings.EVIDENCE_DIR, exist_ok=True)

        try:
            img = cv2.imread(image_path)
            if img is None:
                with open(image_path, "rb") as f:
                    chunk = np.frombuffer(f.read(), dtype=np.uint8)
                    img = cv2.imdecode(chunk, cv2.IMREAD_COLOR)

            if img is None:
                return None

            img_h, img_w = img.shape[:2]
            x1, y1, x2, y2 = bbox

            # Add 10px padding safely within bounds
            pad = 10
            crop_x1 = max(0, int(x1) - pad)
            crop_y1 = max(0, int(y1) - pad)
            crop_x2 = min(img_w, int(x2) + pad)
            crop_y2 = min(img_h, int(y2) + pad)

            if crop_x2 <= crop_x1 or crop_y2 <= crop_y1:
                return None

            crop = img[crop_y1:crop_y2, crop_x1:crop_x2]
            
            crop_filename = f"{evidence_id}_crop.png"
            crop_path = os.path.join(settings.EVIDENCE_DIR, crop_filename)

            is_success, buffer = cv2.imencode(".png", crop)
            if is_success:
                with open(crop_path, "wb") as f:
                    f.write(buffer)
            else:
                cv2.imwrite(crop_path, crop)

            return f"/storage/evidence/{crop_filename}"
        except Exception:
            return None

    @staticmethod
    def get_inspection_evidence(db: Session, inspection_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all evidence records for an inspection session formatted with field metadata and crop URLs.
        """
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise ValueError(f"Inspection session {inspection_id} not found")

        evidence_records = db.query(Evidence).filter(Evidence.inspection_id == inspection_id).all()
        results = []

        for ev in evidence_records:
            field_name = None
            if ev.field_id:
                f_rec = db.query(ExtractedField).filter(ExtractedField.id == ev.field_id).first()
                if f_rec:
                    field_name = f_rec.field_name

            # Generate crop snippet if not present
            crop_url = ev.crop_path
            if not crop_url and ev.image_id and ev.bbox_x is not None:
                img_rec = db.query(InspectionImage).filter(InspectionImage.id == ev.image_id).first()
                if img_rec:
                    bbox = [ev.bbox_x, ev.bbox_y, ev.bbox_x + (ev.bbox_width or 0), ev.bbox_y + (ev.bbox_height or 0)]
                    crop_url = EvidenceService.generate_roi_crop(img_rec.storage_path, bbox, ev.id)
                    if crop_url:
                        ev.crop_path = crop_url
                        db.commit()

            results.append({
                "id": ev.id,
                "inspection_id": ev.inspection_id,
                "image_id": ev.image_id,
                "field_id": ev.field_id,
                "field_name": field_name,
                "source_text": ev.source_text,
                "confidence": ev.confidence,
                "bbox_x": ev.bbox_x,
                "bbox_y": ev.bbox_y,
                "bbox_width": ev.bbox_width,
                "bbox_height": ev.bbox_height,
                "crop_path": ev.crop_path,
                "crop_url": crop_url,
                "created_at": ev.created_at
            })

        return results

evidence_service = EvidenceService()
