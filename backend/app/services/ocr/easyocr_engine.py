from typing import List, Dict, Any
from app.services.ocr.base import BaseOCREngine

class EasyOCREngine(BaseOCREngine):
    def __init__(self):
        self._reader = None
        self._initialized = False

    @property
    def name(self) -> str:
        return "easyocr"

    def is_available(self) -> bool:
        if self._initialized:
            return self._reader is not None
        try:
            import easyocr
            self._reader = easyocr.Reader(['en'], gpu=False)
            self._initialized = True
            return True
        except ImportError:
            self._initialized = True
            self._reader = None
            return False
        except Exception:
            self._initialized = False
            self._reader = None
            return False

    def extract_text(self, image_path: str, image_id: str) -> List[Dict[str, Any]]:
        if not self.is_available() or self._reader is None:
            return []

        try:
            results = self._reader.readtext(image_path)
            ocr_items = []

            for bbox_points, text, confidence in results:
                xs = [p[0] for p in bbox_points]
                ys = [p[1] for p in bbox_points]
                bbox = [float(min(xs)), float(min(ys)), float(max(xs)), float(max(ys))]
                
                clean_text = str(text).strip()
                if clean_text:
                    ocr_items.append({
                        "text": clean_text,
                        "confidence": round(float(confidence), 4),
                        "bbox": bbox,
                        "image_id": image_id,
                        "engine": self.name
                    })

            return ocr_items
        except Exception:
            return []
