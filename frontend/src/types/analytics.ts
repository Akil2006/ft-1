export interface FlaggedFieldStat {
  field_name: string;
  flag_count: number;
  rule_id: string;
  severity: string;
}

export interface StatusDistributionStat {
  status: string;
  count: number;
}

export interface InspectionTrendStat {
  date: string;
  count: number;
}

export interface AnalyticsData {
  total_inspections: number;
  compliant_count: number;
  review_required_count: number;
  missing_info_count: number;
  not_applicable_count: number;
  compliance_rate: number;
  frequently_flagged_fields: FlaggedFieldStat[];
  status_distribution: StatusDistributionStat[];
  inspection_trend: InspectionTrendStat[];
}
