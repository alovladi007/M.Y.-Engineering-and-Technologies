import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Diagnostic API
export const diagnosticsApi = {
  analyze: (data: any) => api.post('/api/v1/diagnostics/analyze', data),
  getById: (id: string) => api.get(`/api/v1/diagnostics/${id}`),
  getByPatient: (patientId: string, page = 1, limit = 10) =>
    api.get(`/api/v1/diagnostics/patient/${patientId}`, { params: { page, limit } }),
  getHistory: (patientId: string) =>
    api.get(`/api/v1/diagnostics/patient/${patientId}/history`),
  export: (id: string, format = 'pdf') =>
    api.post(`/api/v1/diagnostics/${id}/export`, { format }),
}

// Risk Assessment API
export const riskAssessmentApi = {
  calculate: (data: any) => api.post('/api/v1/risk-assessment/calculate', data),
}

// Health Check
export const healthCheck = () => api.get('/health')
