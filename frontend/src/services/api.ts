import axios from 'axios';
import {
  Lead,
  MessageTemplate,
  ImportJob,
  ImportPreviewData,
  Settings,
  OutreachSessionResponse,
  DashboardMetricsResponse,
  FollowUp
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pjn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password?: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('pjn_token', res.data.token);
    }
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('pjn_token');
  }
};

export const leadsService = {
  getLeads: async (params?: Record<string, any>) => {
    const res = await api.get('/leads', { params });
    return res.data;
  },
  getLeadById: async (id: string) => {
    const res = await api.get(`/leads/${id}`);
    return res.data;
  },
  createLead: async (leadData: Partial<Lead>) => {
    const res = await api.post('/leads', leadData);
    return res.data;
  },
  updateLead: async (id: string, leadData: Partial<Lead>) => {
    const res = await api.put(`/leads/${id}`, leadData);
    return res.data;
  },
  deleteLead: async (id: string) => {
    const res = await api.delete(`/leads/${id}`);
    return res.data;
  },
  bulkUpdateStatus: async (leadIds: string[], status: string) => {
    const res = await api.post('/leads/bulk-status', { leadIds, status });
    return res.data;
  },
  bulkDeleteLeads: async (leadIds: string[]) => {
    const res = await api.post('/leads/bulk-delete', { leadIds });
    return res.data;
  }
};

export const importService = {
  uploadFile: async (file: File): Promise<ImportPreviewData> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/imports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  processImport: async (payload: {
    items: any[];
    fileName: string;
    fileType: string;
    fileSize: number;
    duplicateStrategy: 'skip' | 'update' | 'import_as_new';
  }) => {
    const res = await api.post('/imports/process', payload);
    return res.data;
  },
  getHistory: async (): Promise<ImportJob[]> => {
    const res = await api.get('/imports/history');
    return res.data;
  }
};

export const outreachService = {
  getSession: async (statusFilter = 'PENDING,WHATSAPP_OPENED,FOLLOW_UP'): Promise<OutreachSessionResponse> => {
    const res = await api.get('/outreach/session', { params: { statusFilter } });
    return res.data;
  },
  openWhatsApp: async (leadId: string, customMessage?: string) => {
    const res = await api.post('/outreach/open-whatsapp', { leadId, customMessage });
    return res.data;
  },
  markContacted: async (leadId: string, notes?: string) => {
    const res = await api.post('/outreach/mark-contacted', { leadId, notes });
    return res.data;
  },
  nextLead: async (currentLeadId?: string) => {
    const res = await api.post('/outreach/next', { currentLeadId });
    return res.data;
  }
};

export const templateService = {
  getTemplates: async (): Promise<MessageTemplate[]> => {
    const res = await api.get('/templates');
    return res.data;
  },
  createTemplate: async (data: Partial<MessageTemplate>) => {
    const res = await api.post('/templates', data);
    return res.data;
  },
  updateTemplate: async (id: string, data: Partial<MessageTemplate>) => {
    const res = await api.put(`/templates/${id}`, data);
    return res.data;
  },
  deleteTemplate: async (id: string) => {
    const res = await api.delete(`/templates/${id}`);
    return res.data;
  }
};

export const followUpService = {
  createFollowUp: async (data: { leadId: string; date: string; title?: string; time?: string; notes?: string }) => {
    const res = await api.post('/follow-ups', data);
    return res.data;
  },
  getTodayFollowUps: async (): Promise<FollowUp[]> => {
    const res = await api.get('/follow-ups/today');
    return res.data;
  },
  updateStatus: async (id: string, status: string) => {
    const res = await api.put(`/follow-ups/${id}/status`, { status });
    return res.data;
  }
};

export const dashboardService = {
  getStats: async (): Promise<DashboardMetricsResponse> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  }
};

export const settingsService = {
  getSettings: async (): Promise<Settings> => {
    const res = await api.get('/settings');
    return res.data;
  },
  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    const res = await api.put('/settings', data);
    return res.data;
  }
};

export const exportService = {
  downloadCSV: (leadIds?: string[]) => {
    const query = leadIds ? `?leadIds=${leadIds.join(',')}` : '';
    window.open(`/api/exports/csv${query}`, '_blank');
  },
  downloadExcel: (leadIds?: string[]) => {
    const query = leadIds ? `?leadIds=${leadIds.join(',')}` : '';
    window.open(`/api/exports/excel${query}`, '_blank');
  },
  downloadPDF: (leadIds?: string[]) => {
    const query = leadIds ? `?leadIds=${leadIds.join(',')}` : '';
    window.open(`/api/exports/pdf${query}`, '_blank');
  }
};

export default api;
