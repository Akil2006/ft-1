import cv2
import numpy as np
from typing import List, Dict, Any
from app.services.ocr.base import BaseOCREngine

class CVContourOCREngine(BaseOCREngine):
    """
    Fail-safe fallback computer vision engine.
    Detects text-like contours and delegates to EasyOCR / Tesseract if available,
    or extracts text regions so the system remains functional.
    """
    @property
    def name(self) -> str:
        return "cv_contour_fallback"

    def is_available(self) -> bool:
        return True

    def extract_text(self, image_path: str, image_id: str) -> List[Dict[str, Any]]:
        # 1. Attempt EasyOCR if available
        try:
            from app.services.ocr.easyocr_engine import EasyOCREngine
            easy = EasyOCREngine()
            if easy.is_available():
                items = easy.extract_text(image_path, image_id)
                if items:
                    return items
        except Exception:
            pass

        # 2. Attempt PyTesseract if available
        try:
            import pytesseract
            from PIL import Image as PILImage
            pil_img = PILImage.open(image_path)
            data = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT)
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
            if ocr_items:
                return ocr_items
        except Exception:
            pass

        # 3. Fail-safe OpenCV Contour Bounding Box Extractor
        try:
            img = cv2.imread(image_path)
            if img is None:
                with open(image_path, "rb") as f:
                    chunk = np.frombuffer(f.read(), dtype=np.uint8)
                    img = cv2.imdecode(chunk, cv2.IMREAD_COLOR)

            if img is None:
                return []

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img.copy()
            
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 3))
            grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, kernel)
            _, thresh = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            ocr_items = []

            for c in contours:
                x, y, w, h = cv2.boundingRect(c)
                if w >= 20 and h >= 8 and (w / h) > 0.5:
                    ocr_items.append({
                        "text": f"LABEL_REGION [{x},{y},{w},{h}]",
                        "confidence": 0.70,
                        "bbox": [float(x), float(y), float(x + w), float(y + h)],
                        "image_id": image_id,
                        "engine": self.name
                    })

            return ocr_items[:50]
        except Exception:
            return []
