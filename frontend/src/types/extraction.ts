export interface ExtractedField {
  id: string;
  inspection_id: string;
  field_name: string;
  raw_value?: string;
  normalized_value?: string;
  confidence: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ExtractionResult {
  inspection_id: string;
  total_fields_extracted: number;
  fields: ExtractedField[];
}
