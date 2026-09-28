import { apiClient } from './api';
import { AnalyticsData } from '../types/analytics';

export const analyticsApi = {
  async getAnalytics(): Promise<AnalyticsData> {
    const response = await apiClient.get<AnalyticsData>('/analytics');
    return response.data;
  },
};
