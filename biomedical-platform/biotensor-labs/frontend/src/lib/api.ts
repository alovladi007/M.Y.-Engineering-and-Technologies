/**
 * API Client for BioTensor Labs Backend
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

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

// Experiments API
export const experimentsApi = {
  list: (params?: any) => apiClient.get('/experiments', { params }),
  getById: (id: string) => apiClient.get(`/experiments/${id}`),
  create: (data: any) => apiClient.post('/experiments', data),
  delete: (id: string) => apiClient.delete(`/experiments/${id}`),
  listRuns: (experimentId: string, params?: any) =>
    apiClient.get(`/experiments/${experimentId}/runs`, { params }),
  createRun: (experimentId: string, data: any) =>
    apiClient.post(`/experiments/${experimentId}/runs`, data),
  getRun: (runId: string) => apiClient.get(`/experiments/runs/${runId}`),
  logMetric: (runId: string, data: any) =>
    apiClient.post(`/experiments/runs/${runId}/log-metric`, data),
  logParameter: (runId: string, data: any) =>
    apiClient.post(`/experiments/runs/${runId}/log-parameter`, data),
  endRun: (runId: string, status?: string) =>
    apiClient.post(`/experiments/runs/${runId}/end`, { status }),
};

// Models API
export const modelsApi = {
  list: () => apiClient.get('/models'),
  getByName: (name: string) => apiClient.get(`/models/${name}`),
};

// Signals API
export const signalsApi = {
  preprocess: (file: File, params: any) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(params).forEach(key => {
      formData.append(key, params[key]);
    });
    return apiClient.post('/signals/preprocess', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  extractFeatures: (file: File, features: string[]) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('features', JSON.stringify(features));
    return apiClient.post('/signals/extract-features', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default apiClient;
