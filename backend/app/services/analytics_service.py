from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.inspection import Inspection
from app.models.compliance_check import ComplianceCheck

class AnalyticsService:
    @staticmethod
    def get_dashboard_analytics(db: Session, user_id: str) -> Dict[str, Any]:
        """
        Computes real-time dashboard analytics and aggregations directly from DB records.
        """
        user_inspections = db.query(Inspection).filter(Inspection.user_id == user_id)
        total_inspections = user_inspections.count()

        if total_inspections == 0:
            return {
                "total_inspections": 0,
                "compliant_count": 0,
                "review_required_count": 0,
                "missing_info_count": 0,
                "not_applicable_count": 0,
                "compliance_rate": 0.0,
                "frequently_flagged_fields": [],
                "status_distribution": [],
                "inspection_trend": []
            }

        # 1. Overall Result Counts
        compliant_count = user_inspections.filter(Inspection.overall_result == "COMPLIANT").count()
        review_required_count = user_inspections.filter(Inspection.overall_result == "REVIEW_REQUIRED").count()
        missing_info_count = user_inspections.filter(Inspection.overall_result == "MISSING_INFORMATION").count()
        not_applicable_count = user_inspections.filter(Inspection.overall_result == "NOT_APPLICABLE").count()

        compliance_rate = round((compliant_count / total_inspections) * 100.0, 1)

        # 2. Frequently Flagged Fields
        user_insp_ids = [i.id for i in user_inspections.all()]
        flagged_query = db.query(
            ComplianceCheck.field_name,
            ComplianceCheck.rule_id,
            ComplianceCheck.severity,
            func.count(ComplianceCheck.id).label("flag_count")
        ).filter(
            ComplianceCheck.inspection_id.in_(user_insp_ids),
            ComplianceCheck.result.in_(["REVIEW_REQUIRED", "MISSING_INFORMATION"])
        ).group_by(
            ComplianceCheck.field_name,
            ComplianceCheck.rule_id,
            ComplianceCheck.severity
        ).order_by(desc("flag_count")).limit(10).all()

        flagged_fields = [
            {
                "field_name": row[0],
                "rule_id": row[1],
                "severity": row[2],
                "flag_count": row[3]
            }
            for row in flagged_query
        ]

        # 3. Status Distribution
        status_query = db.query(
            Inspection.status,
            func.count(Inspection.id)
        ).filter(Inspection.user_id == user_id).group_by(Inspection.status).all()

        status_dist = [{"status": row[0], "count": row[1]} for row in status_query]

        # 4. Inspection Volume Trend by Date
        trend_query = db.query(
            func.date(Inspection.created_at).label("date_str"),
            func.count(Inspection.id)
        ).filter(Inspection.user_id == user_id).group_by("date_str").order_by("date_str").limit(30).all()

        trend_data = [{"date": str(row[0]), "count": row[1]} for row in trend_query]

        return {
            "total_inspections": total_inspections,
            "compliant_count": compliant_count,
            "review_required_count": review_required_count,
            "missing_info_count": missing_info_count,
            "not_applicable_count": not_applicable_count,
            "compliance_rate": compliance_rate,
            "frequently_flagged_fields": flagged_fields,
            "status_distribution": status_dist,
            "inspection_trend": trend_data
        }

analytics_service = AnalyticsService()
