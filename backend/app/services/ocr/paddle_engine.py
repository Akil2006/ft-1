import cv2
import numpy as np
from typing import List, Dict, Any
from app.services.ocr.base import BaseOCREngine

class PaddleOCREngine(BaseOCREngine):
    def __init__(self):
        self._ocr = None
        self._initialized = False

    @property
    def name(self) -> str:
        return "paddleocr"

    def is_available(self) -> bool:
        if self._initialized:
            return self._ocr is not None
        try:
            from paddleocr import PaddleOCR
            # Initialize lightweight PaddleOCR instance
            self._ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
            self._initialized = True
            return True
        except Exception:
            self._initialized = True
            self._ocr = None
            return False

    def extract_text(self, image_path: str, image_id: str) -> List[Dict[str, Any]]:
        if not self.is_available() or self._ocr is None:
            return []

        try:
            results = self._ocr.ocr(image_path, cls=True)
            ocr_items = []
            if not results or not results[0]:
                return []

            for line in results[0]:
                bbox_points = line[0]  # [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
                text_info = line[1]    # (text, confidence)
                
                text = str(text_info[0]).strip()
                confidence = float(text_info[1])
                
                xs = [p[0] for p in bbox_points]
                ys = [p[1] for p in bbox_points]
                bbox = [float(min(xs)), float(min(ys)), float(max(xs)), float(max(ys))]
                
                if text:
                    ocr_items.append({
                        "text": text,
                        "confidence": round(confidence, 4),
                        "bbox": bbox,
                        "image_id": image_id,
                        "engine": self.name
                    })

            return ocr_items
        except Exception:
            return []
