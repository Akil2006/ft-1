# SmartPack Architecture Specification

SmartPack processes package images through a clean multi-stage pipeline:

1. **Upload & Validation**: Multipart image receiving, file type, dimension, and security validation.
2. **OpenCV Preprocessing**: Multi-step image enhancement (deskew, denoise, contrast, thresholding).
3. **OCR Abstraction Layer**: Pluggable OCR engine (`BaseOCREngine`) executing `PaddleOCR` -> `EasyOCR` -> `Tesseract`.
4. **Structured Field Extraction**: Pattern matching and unit normalization for legal metrology declarations.
5. **Evidence Tracing**: Mapping extracted tokens to bounding boxes `[x1, y1, x2, y2]`.
6. **Applicability Engine**: Contextual determination of which regulatory rules apply to the commodity.
7. **Deterministic Rule Engine**: Non-LLM evaluation against structured JSON rule schemas.
8. **Dashboard & PDF Report**: React dashboard rendering + ReportLab PDF export.
9. **Grounded Regulatory Assistant**: Information lookup grounded in Department of Consumer Affairs sources.

---

## Dashboard Analytics Architecture (Phase 9 Implemented)

Analytics compute live metrics directly from database tables using SQLAlchemy aggregations (zero fake numbers):

```text
                                [SQLAlchemy Aggregator]
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
[Result Breakdown]            [Frequently Flagged Fields]          [Inspection Trend]
Count COMPLIANT, REVIEW,      Group by field_name & rule_id        Count by Date
MISSING_INFO, NOT_APPLICABLE  Sort by flag_count desc              Last 30 Days
```
