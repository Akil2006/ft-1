from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseOCREngine(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Returns name of the OCR engine."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Checks if the underlying OCR library and binary dependencies are installed and operational."""
        pass

    @abstractmethod
    def extract_text(self, image_path: str, image_id: str) -> List[Dict[str, Any]]:
        """
        Extracts text blocks from an image file.
        Returns a list of dict items:
        [
            {
                "text": "MRP ₹120.00",
                "confidence": 0.95,
                "bbox": [x1, y1, x2, y2],
                "image_id": image_id,
                "engine": self.name
            },
            ...
        ]
        """
        pass
