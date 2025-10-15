/**
 * API Client for Biosensing Backend
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003';

// Create axios instance with defaults
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Device API
export const devicesApi = {
  list: (params?: any) => apiClient.get('/devices', { params }),
  getById: (id: string) => apiClient.get(`/devices/${id}`),
  create: (data: any) => apiClient.post('/devices', data),
  update: (id: string, data: any) => apiClient.patch(`/devices/${id}`, data),
  delete: (id: string) => apiClient.delete(`/devices/${id}`),
  connect: (id: string, config?: any) =>
    apiClient.post(`/devices/${id}/connect`, { config }),
  disconnect: (id: string) => apiClient.post(`/devices/${id}/disconnect`),
  sendCommand: (id: string, command: string, params?: any) =>
    apiClient.post(`/devices/${id}/command`, { command, params }),
};

// Patient API
export const patientsApi = {
  list: (params?: any) => apiClient.get('/patients', { params }),
  getById: (id: string) => apiClient.get(`/patients/${id}`),
  create: (data: any) => apiClient.post('/patients', data),
  update: (id: string, data: any) => apiClient.patch(`/patients/${id}`, data),
  delete: (id: string) => apiClient.delete(`/patients/${id}`),
  getDevices: (id: string) => apiClient.get(`/patients/${id}/devices`),
  getAlerts: (id: string, params?: any) =>
    apiClient.get(`/patients/${id}/alerts`, { params }),
};

// Reading API
export const readingsApi = {
  list: (params?: any) => apiClient.get('/readings', { params }),
  getById: (id: string) => apiClient.get(`/readings/${id}`),
  create: (data: any) => apiClient.post('/readings', data),
  delete: (id: string) => apiClient.delete(`/readings/${id}`),
  getDeviceLatest: (deviceId: string) =>
    apiClient.get(`/readings/device/${deviceId}/latest`),
  getPatientLatest: (patientId: string) =>
    apiClient.get(`/readings/patient/${patientId}/latest`),
  getStatistics: (params?: any) =>
    apiClient.get('/readings/statistics', { params }),
};

// Alert API
export const alertsApi = {
  list: (params?: any) => apiClient.get('/alerts', { params }),
  getById: (id: string) => apiClient.get(`/alerts/${id}`),
  acknowledge: (id: string, acknowledgedBy: string) =>
    apiClient.post(`/alerts/${id}/acknowledge`, { acknowledged_by: acknowledgedBy }),
  acknowledgeBatch: (alertIds: string[], acknowledgedBy: string) =>
    apiClient.post('/alerts/acknowledge-batch', {
      alert_ids: alertIds,
      acknowledged_by: acknowledgedBy,
    }),
  delete: (id: string) => apiClient.delete(`/alerts/${id}`),
  getStatistics: (params?: any) =>
    apiClient.get('/alerts/statistics', { params }),
};

// Session API
export const sessionsApi = {
  list: (params?: any) => apiClient.get('/sessions', { params }),
  getById: (id: string) => apiClient.get(`/sessions/${id}`),
  create: (data: any) => apiClient.post('/sessions', data),
  update: (id: string, data: any) => apiClient.patch(`/sessions/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sessions/${id}`),
  end: (id: string, notes?: string) =>
    apiClient.post(`/sessions/${id}/end`, { notes }),
  abort: (id: string, notes?: string) =>
    apiClient.post(`/sessions/${id}/abort`, { notes }),
};

export default apiClient;
