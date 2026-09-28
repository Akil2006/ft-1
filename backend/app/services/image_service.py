import os
import uuid
from typing import Tuple, List
from PIL import Image as PILImage
from fastapi import UploadFile, HTTPException, status
from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

class ImageService:
    @staticmethod
    def validate_image_file(file: UploadFile, content: bytes) -> Tuple[str, str]:
        """Validates uploaded image file extension, size, MIME type, and readability."""
        # 1. Check file size
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image file size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB"
            )
        
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty"
            )

        # 2. Check extension
        filename = file.filename or "uploaded_image.jpg"
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP"
            )

        # 3. Check MIME type (if provided)
        if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
            # Fallback to extension check if content_type is application/octet-stream
            if file.content_type.lower() != "application/octet-stream":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid MIME type '{file.content_type}'. Allowed MIME types: image/jpeg, image/png, image/webp"
                )

        # 4. Readability & Dimension check via Pillow
        try:
            import io
            img = PILImage.open(io.BytesIO(content))
            img.verify()  # Verify image integrity
            
            # Re-open for size check after verify()
            img = PILImage.open(io.BytesIO(content))
            width, height = img.size
            if width < 50 or height < 50:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Image dimensions ({width}x{height}) are too small. Minimum required dimension is 50x50 pixels."
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is corrupted or not a readable image format."
            )

        return ext, filename

    @staticmethod
    def save_original_image(content: bytes, ext: str) -> Tuple[str, str]:
        """Saves original image file to storage/uploads directory safely."""
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        unique_id = str(uuid.uuid4())
        saved_filename = f"{unique_id}{ext}"
        storage_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
        
        with open(storage_path, "wb") as f:
            f.write(content)
            
        return saved_filename, storage_path
