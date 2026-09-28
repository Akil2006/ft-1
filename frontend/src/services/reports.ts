import { apiClient } from './api';

export const reportsApi = {
  async downloadReport(inspectionId: string): Promise<Blob> {
    const response = await apiClient.get(`/inspections/${inspectionId}/report`, {
      responseType: 'blob',
    });
    return response.data;
  },

  triggerBlobDownload(blob: Blob, filename = 'SmartPack_Inspection_Report.pdf'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
