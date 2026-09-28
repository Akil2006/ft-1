import { apiClient } from './api';
import { Rule, InspectionComplianceResult } from '../types/compliance';

export const rulesApi = {
  async listRules(): Promise<Rule[]> {
    const response = await apiClient.get<Rule[]>('/rules');
    return response.data;
  },

  async getRule(ruleId: string): Promise<Rule> {
    const response = await apiClient.get<Rule>(`/rules/${ruleId}`);
    return response.data;
  },

  async triggerCompliance(inspectionId: string): Promise<InspectionComplianceResult> {
    const response = await apiClient.post<InspectionComplianceResult>(`/inspections/${inspectionId}/compliance`);
    return response.data;
  },

  async getComplianceResults(inspectionId: string): Promise<InspectionComplianceResult> {
    const response = await apiClient.get<InspectionComplianceResult>(`/inspections/${inspectionId}/results`);
    return response.data;
  },
};
