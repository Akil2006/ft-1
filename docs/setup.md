# Setup & Testing Guide

## Backend Test Execution (Phases 1 - 9)

```powershell
cd backend
.venv\Scripts\pytest.exe tests/
```

### Running Frontend Build
```powershell
cd frontend
npm run build
```

## API Endpoints Overview

- **Interactive OpenAPI UI**: `http://localhost:8000/docs`
- **Auth**: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- **Inspections**: `POST /api/v1/inspections`, `GET /api/v1/inspections` (Paginated, Search, Filters), `GET /api/v1/inspections/{id}`, `DELETE /api/v1/inspections/{id}`
- **Images**: `POST /api/v1/inspections/{id}/images`, `GET /api/v1/inspections/{id}/images`
- **OCR**: `POST /api/v1/inspections/{id}/ocr`, `GET /api/v1/inspections/{id}/ocr`
- **Field Extraction**: `POST /api/v1/inspections/{id}/extract`, `GET /api/v1/inspections/{id}/fields`
- **Rules & Results**: `GET /api/v1/rules`, `GET /api/v1/rules/{id}`, `POST /api/v1/inspections/{id}/compliance`, `GET /api/v1/inspections/{id}/results`
- **Evidence**: `GET /api/v1/inspections/{id}/evidence`
- **Analytics**: `GET /api/v1/analytics`
