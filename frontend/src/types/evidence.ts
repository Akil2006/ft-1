export interface Evidence {
  id: string;
  inspection_id: string;
  image_id?: string;
  field_id?: string;
  field_name?: string;
  source_text?: string;
  confidence: number;
  bbox_x?: number;
  bbox_y?: number;
  bbox_width?: number;
  bbox_height?: number;
  crop_path?: string;
  crop_url?: string;
  created_at: string;
}

export interface InspectionEvidenceResult {
  inspection_id: string;
  total_evidence_items: number;
  evidence: Evidence[];
}
