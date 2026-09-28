import { apiClient } from './api';
import { User, UserRole } from '../types/auth';
import { InspectionFilterParams, PaginatedInspections } from '../types/inspection';

export interface AdminAnalyticsData {
  total_users: number;
  active_users: number;
  total_inspections: number;
  completed_inspections: number;
  compliant_count: number;
  review_required_count: number;
  missing_info_count: number;
}

export const adminApi = {
  async getUsers(params?: { role?: string; search?: string }): Promise<User[]> {
    const response = await apiClient.get<User[]>('/admin/users', { params });
    return response.data;
  },

  async updateUserStatus(userId: string, is_active: boolean): Promise<User> {
    const response = await apiClient.patch<User>(`/admin/users/${userId}/status`, { is_active });
    return response.data;
  },

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const response = await apiClient.patch<User>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async getAllInspections(params?: InspectionFilterParams): Promise<PaginatedInspections> {
    const response = await apiClient.get<PaginatedInspections>('/admin/inspections', { params });
    return response.data;
  },

  async getAdminAnalytics(): Promise<AdminAnalyticsData> {
    const response = await apiClient.get<AdminAnalyticsData>('/admin/analytics');
    return response.data;
  },
};
