/**
 * API Client for HIPAA Compliance Backend
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';

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

// Audit Logs API
export const auditLogsApi = {
  list: (params?: any) => apiClient.get('/audit-logs', { params }),
  getById: (id: string) => apiClient.get(`/audit-logs/${id}`),
  getUserSummary: (userId: string, days?: number) =>
    apiClient.get(`/audit-logs/user/${userId}/summary`, { params: { days } }),
  getStatistics: (params?: any) =>
    apiClient.get('/audit-logs/statistics', { params }),
  generateReport: (data: any) => apiClient.post('/audit-logs/report', data),
};

// BAA API
export const baaApi = {
  list: (params?: any) => apiClient.get('/baa', { params }),
  getById: (id: string) => apiClient.get(`/baa/${id}`),
  create: (data: any) => apiClient.post('/baa', data),
  update: (id: string, data: any) => apiClient.patch(`/baa/${id}`, data),
  delete: (id: string) => apiClient.delete(`/baa/${id}`),
  sign: (id: string) => apiClient.post(`/baa/${id}/sign`),
  getExpiring: (days?: number) =>
    apiClient.get('/baa/expiring', { params: { days } }),
};

// Data Breach API
export const breachApi = {
  list: (params?: any) => apiClient.get('/breaches', { params }),
  getById: (id: string) => apiClient.get(`/breaches/${id}`),
  create: (data: any) => apiClient.post('/breaches', data),
  update: (id: string, data: any) => apiClient.patch(`/breaches/${id}`, data),
  notify: (id: string) => apiClient.post(`/breaches/${id}/notify`),
  resolve: (id: string, data: any) =>
    apiClient.post(`/breaches/${id}/resolve`, data),
};

// Encryption API
export const encryptionApi = {
  encrypt: (data: { plaintext: string }) =>
    apiClient.post('/encryption/encrypt', data),
  decrypt: (data: any) => apiClient.post('/encryption/decrypt', data),
  generateKey: () => apiClient.post('/encryption/keys/generate'),
  rotateKey: (keyId: string) =>
    apiClient.post(`/encryption/keys/${keyId}/rotate`),
  listKeys: (params?: any) => apiClient.get('/encryption/keys', { params }),
  getKey: (keyId: string) => apiClient.get(`/encryption/keys/${keyId}`),
};

export default apiClient;
