import { apiClient } from './api';
import { BatchResponse, BatchDetailResponse } from '../types/batch';

export const batchApi = {
  async createBatch(files: File[], name: string = 'Batch Inspection'): Promise<BatchDetailResponse> {
    const formData = new FormData();
    formData.append('name', name);
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post<BatchDetailResponse>('/batches', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async listBatches(): Promise<BatchDetailResponse[]> {
    const response = await apiClient.get<BatchDetailResponse[]>('/batches');
    return response.data;
  },

  async getBatch(batchId: string): Promise<BatchDetailResponse> {
    const response = await apiClient.get<BatchDetailResponse>(`/batches/${batchId}`);
    return response.data;
  },
};
