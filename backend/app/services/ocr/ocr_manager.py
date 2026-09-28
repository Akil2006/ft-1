from typing import List, Dict, Any
from app.config import settings
from app.services.ocr.base import BaseOCREngine
from app.services.ocr.paddle_engine import PaddleOCREngine
from app.services.ocr.easyocr_engine import EasyOCREngine
from app.services.ocr.tesseract_engine import TesseractOCREngine
from app.services.ocr.cv_contour_engine import CVContourOCREngine

class OCRManager:
    def __init__(self):
        self.engines: Dict[str, BaseOCREngine] = {
            "paddle": PaddleOCREngine(),
            "easyocr": EasyOCREngine(),
            "tesseract": TesseractOCREngine(),
            "cv_contour": CVContourOCREngine()
        }

    def get_preferred_engine(self) -> BaseOCREngine:
        preferred_name = settings.OCR_ENGINE.lower()
        engine = self.engines.get(preferred_name)
        if engine and engine.is_available():
            return engine
        
        # Fallback chain
        fallback_order = ["paddle", "easyocr", "tesseract", "cv_contour"]
        for name in fallback_order:
            eng = self.engines.get(name)
            if eng and eng.is_available():
                return eng
        
        return self.engines["cv_contour"]

    def extract_text_from_image(self, image_path: str, image_id: str) -> List[Dict[str, Any]]:
        """
        Executes OCR processing on an image file.
        Attempts preferred OCR engine first, then falls back down the chain if enabled.
        """
        preferred_name = settings.OCR_ENGINE.lower()
        engine_sequence = []

        if preferred_name in self.engines:
            engine_sequence.append(self.engines[preferred_name])

        if settings.OCR_FALLBACK_ENABLED:
            fallback_order = ["paddle", "easyocr", "tesseract", "cv_contour"]
            for name in fallback_order:
                eng = self.engines[name]
                if eng not in engine_sequence:
                    engine_sequence.append(eng)

        for engine in engine_sequence:
            if engine.is_available():
                try:
                    items = engine.extract_text(image_path, image_id)
                    if items:  # Successfully extracted text blocks
                        return items
                except Exception:
                    continue

        # Ultimate fallback to CV contour engine
        return self.engines["cv_contour"].extract_text(image_path, image_id)

ocr_manager = OCRManager()
