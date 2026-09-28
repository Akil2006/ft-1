# SmartPack – AI-Powered Packaged Commodity Inspection and Legal Metrology Compliance Assistance System

SmartPack is a production-grade hackathon prototype for automated preliminary inspection of packaged commodity label declarations against Legal Metrology Rules (Package Commodity Rules, 2011 & Amendments).

---

## Key Features

- **Multi-Image Package Inspection**: Accept front, back, side, and top/bottom package images.
- **OpenCV Preprocessing Pipeline**: Resizing, deskewing, noise reduction, contrast enhancement, sharpening, and adaptive thresholding.
- **OCR Abstraction Layer**: Primary `PaddleOCR` engine with fallbacks to `EasyOCR` and `Tesseract`.
- **Deterministic Field Extraction**: Structured pattern matching for `MRP`, `Net Quantity`, `Manufacturing/Packing Date`, `Expiry/Best Before`, `Manufacturer/Packer/Importer`, `Consumer Care`, and `Country of Origin`.
- **Versioned Rule Engine**: Rule applicability evaluation and deterministic compliance logic yielding `COMPLIANT`, `REVIEW_REQUIRED`, `MISSING_INFORMATION`, or `NOT_APPLICABLE`.
- **Interactive Evidence Viewer**: Bounding box coordinate highlighting and region-of-interest (ROI) evidence snippets over original package labels.
- **ReportLab PDF Reports**: Multi-page report generation with full audit log and legal disclaimers.
- **Grounded Regulatory Assistant**: Local knowledge base answering questions grounded in official Department of Consumer Affairs Legal Metrology rules.

---

## Directory Structure

```text
smartpack/
├── backend/            # FastAPI REST API, SQLAlchemy DB models, Services, Rule Engine
├── frontend/           # React + TypeScript + Vite + Tailwind CSS dashboard UI
├── data/               # Versioned legal metrology rules and regulatory knowledge base
├── storage/            # Local directory storage for uploads, processed images, evidence, and PDF reports
├── docs/               # System documentation (architecture, API, rules, setup)
├── docker-compose.yml  # Docker deployment configuration
└── README.md
```

---

## Quick Setup

### Backend Setup

```bash
cd backend
python -m venv .venv
# Activate virtual environment
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend OpenAPI documentation will be available at: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend application will be available at: `http://localhost:5173`

---

## Disclaimer

SmartPack provides automated preliminary inspection assistance based on package images, computer vision, OCR text, and configured rule engines. It does **not** provide an official legal determination or legal certificate. Uncertain or flagged items require official human review.
