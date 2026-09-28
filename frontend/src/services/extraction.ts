import { apiClient } from './api';
import { ExtractionResult } from '../types/extraction';

export const extractionApi = {
  async triggerExtraction(inspectionId: string): Promise<ExtractionResult> {
    const response = await apiClient.post<ExtractionResult>(`/inspections/${inspectionId}/extract`);
    return response.data;
  },

  async getExtractedFields(inspectionId: string): Promise<ExtractionResult> {
    const response = await apiClient.get<ExtractionResult>(`/inspections/${inspectionId}/fields`);
    return response.data;
  },
};
