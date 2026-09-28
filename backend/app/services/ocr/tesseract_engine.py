from typing import List, Dict, Any
from PIL import Image as PILImage
from app.services.ocr.base import BaseOCREngine

class TesseractOCREngine(BaseOCREngine):
    def __init__(self):
        self._available = None

    @property
    def name(self) -> str:
        return "tesseract"

    def is_available(self) -> bool:
        if self._available is not None:
            return self._available
        try:
            import pytesseract
            # Test pytesseract binary access
            _ = pytesseract.get_tesseract_version()
            self._available = True
        except Exception:
            self._available = False
        return self._available

    def extract_text(self, image_path: str, image_id: str) -> List[Dict[str, Any]]:
        if not self.is_available():
            return []

        try:
            import pytesseract
            img = PILImage.open(image_path)
            data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            
            ocr_items = []
            n_boxes = len(data["text"])
            for i in range(n_boxes):
                text = str(data["text"][i]).strip()
                conf = float(data["conf"][i])
                if text and conf > 0:
                    x = float(data["left"][i])
                    y = float(data["top"][i])
                    w = float(data["width"][i])
                    h = float(data["height"][i])
                    
                    ocr_items.append({
                        "text": text,
                        "confidence": round(conf / 100.0, 4),
                        "bbox": [x, y, x + w, y + h],
                        "image_id": image_id,
                        "engine": self.name
                    })

            return ocr_items
        except Exception:
            return []
