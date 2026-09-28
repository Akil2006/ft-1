import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.batch import InspectionBatch
from app.models.inspection import Inspection
from app.models.image import InspectionImage
from app.services.image_service import ImageService
from app.services.preprocessing_service import PreprocessingService
from app.services.ocr_service import ocr_service
from app.services.extraction_service import extraction_service
from app.services.compliance_service import compliance_service

class BatchService:
    @classmethod
    def create_and_process_batch(
        cls,
        db: Session,
        user_id: str,
        name: str,
        files_data: List[Tuple[bytes, str]]  # List of (file_bytes, original_filename)
    ) -> InspectionBatch:
        """
        Creates a Batch Inspection session, spawns separate Inspection records for each package image,
        and processes each inspection sequentially with full error isolation.
        """
        batch = InspectionBatch(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=name or "Batch Inspection",
            status="PROCESSING",
            total_count=len(files_data),
            completed_count=0,
            failed_count=0
        )
        db.add(batch)
        db.commit()
        db.refresh(batch)

        inspections: List[Inspection] = []

        for idx, (content, original_filename) in enumerate(files_data, start=1):
            prod_name = os.path.splitext(original_filename)[0].replace("_", " ").replace("-", " ").title()
            
            inspection = Inspection(
                id=str(uuid.uuid4()),
                user_id=user_id,
                batch_id=batch.id,
                product_name=prod_name,
                category="General Package",
                package_type="Standard Package",
                status="UPLOADED"
            )
            db.add(inspection)
            db.commit()
            db.refresh(inspection)

            # 1. Save Image
            try:
                ext, norm_filename = ImageService.validate_image_file_raw(original_filename, content)
                saved_name, storage_path = ImageService.save_original_image(content, ext)
                
                img_record = InspectionImage(
                    inspection_id=inspection.id,
                    filename=norm_filename,
                    storage_path=storage_path,
                    image_type="FRONT",
                    processing_status="PREPROCESSING"
                )
                db.add(img_record)
                db.commit()

                # Preprocessing
                try:
                    proc_path, w, h = PreprocessingService.preprocess_image(storage_path, img_record.id)
                    img_record.width = w
                    img_record.height = h
                    img_record.processing_status = "PROCESSED"
                except Exception:
                    img_record.processing_status = "PROCESSED"
                db.commit()
                inspections.append(inspection)
            except Exception as e:
                inspection.status = "FAILED"
                inspection.overall_result = "REVIEW_REQUIRED"
                batch.failed_count += 1
                db.commit()

        # 2. Process Inspections Sequentially with Error Isolation
        for inspection in inspections:
            try:
                # Run OCR
                ocr_service.process_inspection_ocr(db, inspection.id)
                # Run Extraction
                extraction_service.process_inspection_extraction(db, inspection.id)
                # Run Compliance & Completeness & Hash
                compliance_service.process_inspection_compliance(db, inspection.id)
                
                batch.completed_count += 1
            except Exception:
                inspection.status = "FAILED"
                inspection.overall_result = "REVIEW_REQUIRED"
                batch.failed_count += 1
            db.commit()

        # Update Final Batch Status
        if batch.failed_count == batch.total_count and batch.total_count > 0:
            batch.status = "FAILED"
        else:
            batch.status = "COMPLETED"
        
        db.commit()
        db.refresh(batch)
        return batch

batch_service = BatchService()
