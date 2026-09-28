import { apiClient } from './api';
import { InspectionEvidenceResult } from '../types/evidence';

export const evidenceApi = {
  async getInspectionEvidence(inspectionId: string): Promise<InspectionEvidenceResult> {
    const response = await apiClient.get<InspectionEvidenceResult>(`/inspections/${inspectionId}/evidence`);
    return response.data;
  },
};
