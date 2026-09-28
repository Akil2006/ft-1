import { Inspection } from './inspection';

export interface BatchResponse {
  id: string;
  user_id: string;
  name: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  total_count: number;
  completed_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

export interface BatchDetailResponse extends BatchResponse {
  inspections: Inspection[];
}
