import { apiClient } from './api';
import { OCRResult } from '../types/ocr';

export const ocrApi = {
  async triggerOCR(inspectionId: string): Promise<OCRResult> {
    const response = await apiClient.post<OCRResult>(`/inspections/${inspectionId}/ocr`);
    return response.data;
  },

  async getOCRResults(inspectionId: string): Promise<OCRResult> {
    const response = await apiClient.get<OCRResult>(`/inspections/${inspectionId}/ocr`);
    return response.data;
  },
};
