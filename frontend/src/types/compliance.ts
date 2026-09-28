export type ComplianceResultStatus =
  | 'COMPLIANT'
  | 'REVIEW_REQUIRED'
  | 'MISSING_INFORMATION'
  | 'NOT_APPLICABLE';

export interface Rule {
  rule_id: string;
  rule_version: string;
  rule_title: string;
  field: string;
  applicability: Record<string, any>;
  requirement: string;
  validation_method: string;
  severity: string;
  source_document: string;
  source_section?: string;
  effective_date?: string;
  exceptions: string[];
  notes?: string;
}

export interface ComplianceCheck {
  id: string;
  inspection_id: string;
  rule_id: string;
  rule_version: string;
  field_name: string;
  applicable: boolean;
  result: ComplianceResultStatus;
  severity: string;
  detected_value?: string;
  reason?: string;
  created_at: string;
}

export interface InspectionComplianceResult {
  inspection_id: string;
  overall_result: ComplianceResultStatus;
  total_rules_checked: number;
  compliant_count: number;
  review_required_count: number;
  missing_info_count: number;
  not_applicable_count: number;
  checks: ComplianceCheck[];
}
