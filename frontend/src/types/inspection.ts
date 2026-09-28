export type ImageType = 'FRONT' | 'BACK' | 'SIDE' | 'TOP' | 'BOTTOM' | 'OTHER';

export type InspectionStatus =
  | 'UPLOADED'
  | 'PREPROCESSING'
  | 'OCR_PROCESSING'
  | 'EXTRACTING'
  | 'RULE_EVALUATION'
  | 'COMPLETED'
  | 'FAILED';

export type OverallResult =
  | 'COMPLIANT'
  | 'REVIEW_REQUIRED'
  | 'MISSING_INFORMATION'
  | 'NOT_APPLICABLE';

export interface InspectionImage {
  id: string;
  inspection_id: string;
  filename: string;
  storage_path: string;
  image_type: ImageType;
  width?: number;
  height?: number;
  processing_status: string;
  created_at: string;
}

export interface Inspection {
  id: string;
  user_id: string;
  product_name?: string;
  category?: string;
  package_type?: string;
  status: InspectionStatus;
  overall_result?: OverallResult;
  created_at: string;
  updated_at: string;
  images: InspectionImage[];
}

export interface CreateInspectionPayload {
  product_name?: string;
  category?: string;
  package_type?: string;
}

export interface InspectionFilterParams {
  search?: string;
  status?: string;
  overall_result?: string;
  category?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedInspections {
  total: number;
  page: number;
  limit: number;
  pages: number;
  items: Inspection[];
}
