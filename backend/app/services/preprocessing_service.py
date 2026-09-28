import os
import cv2
import numpy as np
from typing import Tuple, Dict, Any
from app.config import settings

class PreprocessingService:
    @staticmethod
    def preprocess_image(original_path: str, image_id: str) -> Tuple[str, int, int]:
        """
        Executes OpenCV preprocessing pipeline on original package image:
        1. Read Image
        2. Resize maintaining aspect ratio (max dimension 1600px)
        3. Grayscale conversion
        4. Orientation detection & Deskewing
        5. Bilateral / Denoise filter
        6. Contrast Limited Adaptive Histogram Equalization (CLAHE)
        7. Kernel Sharpening
        8. Save processed version to storage/processed/
        """
        os.makedirs(settings.PROCESSED_DIR, exist_ok=True)

        # 1. Read Image using numpy to handle all paths cleanly
        img = cv2.imread(original_path)
        if img is None:
            # Fallback for unicode file paths
            with open(original_path, "rb") as f:
                chunk = np.frombuffer(f.read(), dtype=np.uint8)
                img = cv2.imdecode(chunk, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError(f"Could not load image file from path: {original_path}")

        orig_height, orig_width = img.shape[:2]

        # 2. Resize maintaining aspect ratio if image is too large
        max_dim = 1600
        if max(orig_height, orig_width) > max_dim:
            if orig_width > orig_height:
                new_width = max_dim
                new_height = int(orig_height * (max_dim / orig_width))
            else:
                new_height = max_dim
                new_width = int(orig_width * (max_dim / orig_height))
            resized = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)
        else:
            resized = img.copy()

        # 3. Grayscale conversion
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

        # 4. Deskewing
        deskewed = PreprocessingService._deskew(gray)

        # 5. Denoise Filter
        denoised = cv2.bilateralFilter(deskewed, d=9, sigmaColor=75, sigmaSpace=75)

        # 6. CLAHE Contrast Enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)

        # 7. Kernel Sharpening
        sharpen_kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
        sharpened = cv2.filter2D(enhanced, -1, sharpen_kernel)

        # 8. Save Processed Image
        processed_filename = f"{image_id}_processed.png"
        processed_path = os.path.join(settings.PROCESSED_DIR, processed_filename)

        # Save image using cv2.imwrite
        is_success, buffer = cv2.imencode(".png", sharpened)
        if is_success:
            with open(processed_path, "wb") as f:
                f.write(buffer)
        else:
            cv2.imwrite(processed_path, sharpened)

        return processed_path, orig_width, orig_height

    @staticmethod
    def _deskew(gray_img: np.ndarray) -> np.ndarray:
        """Detects text orientation angle and deskews image if skew angle is within +/- 15 degrees."""
        try:
            # Threshold to get text region contours
            _, thresh = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            coords = np.column_stack(np.where(thresh > 0))
            if len(coords) < 100:
                return gray_img

            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle

            # Only deskew if slight angle is detected (0.5 to 15 degrees)
            if 0.5 <= abs(angle) <= 15.0:
                (h, w) = gray_img.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                rotated = cv2.warpAffine(gray_img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                return rotated
        except Exception:
            pass

        return gray_img
