import { apiClient } from './api';
import { RegulatoryQueryResponse, RegulatorySection } from '../types/regulatory';

export const regulatoryService = {
  queryAssistant: async (query: string): Promise<RegulatoryQueryResponse> => {
    const response = await apiClient.post<RegulatoryQueryResponse>('/regulatory/query', { query });
    return response.data;
  },

  getSections: async (): Promise<RegulatorySection[]> => {
    const response = await apiClient.get<RegulatorySection[]>('/regulatory/sections');
    return response.data;
  },
};
