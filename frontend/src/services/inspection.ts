import { apiClient } from './api';
import {
  Inspection,
  InspectionImage,
  CreateInspectionPayload,
  ImageType,
  InspectionFilterParams,
  PaginatedInspections,
} from '../types/inspection';

export const inspectionApi = {
  async createInspection(payload: CreateInspectionPayload): Promise<Inspection> {
    const response = await apiClient.post<Inspection>('/inspections', payload);
    return response.data;
  },

  async listInspections(params: InspectionFilterParams = {}): Promise<PaginatedInspections> {
    const response = await apiClient.get<PaginatedInspections>('/inspections', {
      params,
    });
    return response.data;
  },

  async getInspection(id: string): Promise<Inspection> {
    const response = await apiClient.get<Inspection>(`/inspections/${id}`);
    return response.data;
  },

  async deleteInspection(id: string): Promise<void> {
    await apiClient.delete(`/inspections/${id}`);
  },

  async uploadImages(
    inspectionId: string,
    files: File[],
    imageType: ImageType = 'FRONT'
  ): Promise<InspectionImage[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('image_type', imageType);

    const response = await apiClient.post<InspectionImage[]>(
      `/inspections/${inspectionId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async getInspectionImages(inspectionId: string): Promise<InspectionImage[]> {
    const response = await apiClient.get<InspectionImage[]>(`/inspections/${inspectionId}/images`);
    return response.data;
  },

  async finalizeInspection(inspectionId: string): Promise<Inspection> {
    const response = await apiClient.post<Inspection>(`/inspections/${inspectionId}/finalize`);
    return response.data;
  },

  async verifyIntegrity(inspectionId: string): Promise<{
    valid: boolean;
    algorithm: string;
    stored_hash?: string;
    calculated_hash?: string;
    message: string;
  }> {
    const response = await apiClient.post(`/inspections/${inspectionId}/verify-integrity`);
    return response.data;
  },
};
