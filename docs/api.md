# SmartPack API Documentation

## Dashboard Analytics API (Phase 9 Implemented)

### Get Real-Time Dashboard Analytics
- **URL**: `GET /api/v1/analytics`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response** (`200 OK`):
  ```json
  {
    "total_inspections": 24,
    "compliant_count": 18,
    "review_required_count": 4,
    "missing_info_count": 2,
    "not_applicable_count": 0,
    "compliance_rate": 75.0,
    "frequently_flagged_fields": [
      {
        "field_name": "mrp",
        "flag_count": 4,
        "rule_id": "LM-MRP-001",
        "severity": "CRITICAL"
      }
    ],
    "status_distribution": [
      { "status": "COMPLETED", "count": 22 },
      { "status": "UPLOADED", "count": 2 }
    ],
    "inspection_trend": [
      { "date": "2026-09-27", "count": 24 }
    ]
  }
  ```

---

## History & Search API (Phase 8 Implemented)
- `GET /api/v1/inspections` (Paginated, Search, Filters)

---

## Evidence API (Phase 7 Implemented)
- `GET /api/v1/inspections/{id}/evidence`

---

## Rules & Results API (Phase 6 Implemented)
- `GET /api/v1/rules`
- `GET /api/v1/rules/{id}`
- `POST /api/v1/inspections/{id}/compliance`
- `GET /api/v1/inspections/{id}/results`

---

## Field Extraction API (Phase 5 Implemented)
- `POST /api/v1/inspections/{id}/extract`
- `GET /api/v1/inspections/{id}/fields`

---

## OCR API (Phase 4 Implemented)
- `POST /api/v1/inspections/{id}/ocr`
- `GET /api/v1/inspections/{id}/ocr`

---

## Inspections & Images API (Phase 3 Implemented)
- `POST /api/v1/inspections`
- `GET /api/v1/inspections`
- `GET /api/v1/inspections/{id}`
- `DELETE /api/v1/inspections/{id}`
- `POST /api/v1/inspections/{id}/images`
- `GET /api/v1/inspections/{id}/images`

---

## Authentication API (Phase 2 Implemented)
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
