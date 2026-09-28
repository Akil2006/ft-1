import os
from datetime import datetime, timezone
from typing import Tuple
from sqlalchemy.orm import Session

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from app.config import settings
from app.models.inspection import Inspection
from app.models.extracted_field import ExtractedField
from app.models.compliance_check import ComplianceCheck
from app.models.evidence import Evidence
from app.services.compliance_service import compliance_service

class ReportService:
    @staticmethod
    def generate_pdf_report(db: Session, inspection_id: str) -> Tuple[str, str]:
        """
        Generates a multi-page ReportLab PDF inspection report for an inspection session.
        Returns tuple: (pdf_file_path, pdf_relative_url)
        """
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            raise ValueError(f"Inspection session {inspection_id} not found")

        os.makedirs(settings.REPORT_DIR, exist_ok=True)
        report_filename = f"{inspection_id}_report.pdf"
        report_path = os.path.join(settings.REPORT_DIR, report_filename)

        # Build document template
        doc = SimpleDocTemplate(
            report_path,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        elements = []
        styles = getSampleStyleSheet()

        # Custom Palette & Styles
        primary_color = colors.HexColor("#0F172A")    # Slate 900
        secondary_color = colors.HexColor("#0284C7")  # Sky 600
        text_color = colors.HexColor("#334155")       # Slate 700

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=primary_color
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748B")
        )
        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=primary_color,
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'BodyDark',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=text_color
        )
        body_bold = ParagraphStyle(
            'BodyBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=primary_color
        )
        disclaimer_style = ParagraphStyle(
            'DisclaimerText',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#475569")
        )

        # 1. Header Banner
        elements.append(Paragraph("SMARTPACK PRELIMINARY INSPECTION REPORT", title_style))
        elements.append(Paragraph("AI-Powered Package Commodity & Legal Metrology Screening System", subtitle_style))
        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=2, color=secondary_color, spaceAfter=12))

        # 2. Metadata Table
        created_str = inspection.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if inspection.created_at else "N/A"
        overall_res = inspection.overall_result or "REVIEW_REQUIRED"
        
        # Color badge formatting for status
        badge_bg = "#059669" if overall_res == "COMPLIANT" else ("#D97706" if overall_res == "REVIEW_REQUIRED" else "#DC2626")
        res_html = f'<font color="{badge_bg}"><b>{overall_res}</b></font>'

        meta_data = [
            [Paragraph("Inspection ID:", body_bold), Paragraph(inspection.id, body_style),
             Paragraph("Created Date:", body_bold), Paragraph(created_str, body_style)],
            [Paragraph("Product Name:", body_bold), Paragraph(inspection.product_name or "N/A", body_style),
             Paragraph("Category:", body_bold), Paragraph(inspection.category or "N/A", body_style)],
            [Paragraph("Package Type:", body_bold), Paragraph(inspection.package_type or "N/A", body_style),
             Paragraph("Overall Result:", body_bold), Paragraph(res_html, body_style)]
        ]

        meta_table = Table(meta_data, colWidths=[1.1*inch, 2.4*inch, 1.1*inch, 2.4*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 14))

        # 3. Extracted Declarations Section
        elements.append(Paragraph("1. Extracted Package Declarations", h2_style))
        fields = db.query(ExtractedField).filter(ExtractedField.inspection_id == inspection_id).all()
        
        if fields:
            field_rows = [
                [Paragraph("Field Name", body_bold), Paragraph("Extracted Raw Text", body_bold), Paragraph("Confidence", body_bold)]
            ]
            for f in fields:
                conf_str = f"{round(f.confidence * 100, 1)}%"
                field_rows.append([
                    Paragraph(f.field_name.replace("_", " ").title(), body_bold),
                    Paragraph(f.raw_value or "Not Detected", body_style),
                    Paragraph(conf_str, body_style)
                ])
            field_table = Table(field_rows, colWidths=[1.8*inch, 4.0*inch, 1.2*inch])
            field_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(field_table)
        else:
            elements.append(Paragraph("No extracted field declarations found.", body_style))
        
        elements.append(Spacer(1, 14))

        # 4. Compliance Check Rule Trace Section
        elements.append(Paragraph("2. Legal Metrology Compliance Rule Trace", h2_style))
        checks = db.query(ComplianceCheck).filter(ComplianceCheck.inspection_id == inspection_id).all()
        if not checks:
            checks = compliance_service.process_inspection_compliance(db, inspection_id)

        if checks:
            rule_rows = [
                [Paragraph("Rule ID", body_bold), Paragraph("Field", body_bold), Paragraph("Result Status", body_bold), Paragraph("Reason / Trace Explanation", body_bold)]
            ]
            for c in checks:
                status_color = "#059669" if c.result == "COMPLIANT" else ("#D97706" if c.result == "REVIEW_REQUIRED" else ("#DC2626" if c.result == "MISSING_INFORMATION" else "#64748B"))
                status_p = Paragraph(f'<font color="{status_color}"><b>{c.result}</b></font>', body_style)
                
                rule_rows.append([
                    Paragraph(f"<b>{c.rule_id}</b><br/><font size=7 color='#64748B'>v{c.rule_version}</font>", body_style),
                    Paragraph(c.field_name.replace("_", " ").title(), body_style),
                    status_p,
                    Paragraph(c.reason or "Check completed.", body_style)
                ])
            rule_table = Table(rule_rows, colWidths=[1.1*inch, 1.2*inch, 1.5*inch, 3.2*inch])
            rule_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(rule_table)

        elements.append(Spacer(1, 14))

        # 5. Evidence Snippets Section
        evidence_items = db.query(Evidence).filter(Evidence.inspection_id == inspection_id).all()
        crop_paths = [e.crop_path for e in evidence_items if e.crop_path and os.path.exists(e.crop_path.replace("/storage/", "./storage/"))]

        if crop_paths:
            elements.append(Paragraph("3. Cropped Bounding Box Evidence Snippets", h2_style))
            img_elements = []
            for cp in crop_paths[:4]:  # Embed top 4 evidence snippets
                disk_p = cp.replace("/storage/", "./storage/")
                try:
                    img_elements.append(RLImage(disk_p, width=2.8*inch, height=1.2*inch))
                except Exception:
                    pass

            if img_elements:
                grid_data = []
                for i in range(0, len(img_elements), 2):
                    row = img_elements[i:i+2]
                    if len(row) == 1:
                        row.append(Paragraph("", body_style))
                    grid_data.append(row)
                ev_table = Table(grid_data, colWidths=[3.5*inch, 3.5*inch])
                elements.append(ev_table)
                elements.append(Spacer(1, 14))

        # 6. Legal Disclaimer Box
        elements.append(Spacer(1, 10))
        disclaimer_box = [
            [Paragraph("<b>OFFICIAL PRELIMINARY SCREENING DISCLAIMER</b>", body_bold)],
            [Paragraph("SmartPack provides automated preliminary inspection and screening based on package images, computer vision, OCR text, configured regulatory rules, and available evidence. The outputs produced are intended to assist inspection screening and do not constitute an official legal determination, legal certificate, or enforcement decision. Uncertain or flagged items must be reviewed by an authorized human inspector.", disclaimer_style)]
        ]
        disc_table = Table(disclaimer_box, colWidths=[7.0*inch])
        disc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),  # Amber 100
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#F59E0B")),       # Amber 500
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(KeepTogether(disc_table))

        # Build Document PDF
        doc.build(elements)

        rel_url = f"/storage/reports/{report_filename}"
        return report_path, rel_url

report_service = ReportService()
