/**
 * API Client for Medical Imaging AI Backend
 */

import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutes for ML inference
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Images API
export const imagesApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/v1/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  getById: (imageId: string) => api.get(`/api/v1/images/${imageId}`),
  download: (imageId: string) => api.get(`/api/v1/images/${imageId}/download`, {
    responseType: 'blob',
  }),
  getByPatient: (patientId: string, modality?: string) =>
    api.get(`/api/v1/images/patient/${patientId}`, { params: { modality } }),
  delete: (imageId: string) => api.delete(`/api/v1/images/${imageId}`),
}

// Inference API
export const inferenceApi = {
  analyze: (imageId: string, options?: {
    model_name?: string
    generate_gradcam?: boolean
    gradcam_method?: string
  }) => api.post(`/api/v1/inference/${imageId}/analyze`, null, { params: options }),
  getById: (inferenceId: string) => api.get(`/api/v1/inference/${inferenceId}`),
  getByImage: (imageId: string) => api.get(`/api/v1/inference/image/${imageId}/results`),
  listModels: () => api.get('/api/v1/inference/models/available'),
  submitReview: (inferenceId: string, review: {
    radiologist_id: string
    is_correct: string
    feedback: string
    true_label?: string
  }) => api.post(`/api/v1/inference/${inferenceId}/review`, review),
}

// Studies API
export const studiesApi = {
  getById: (studyUid: string) => api.get(`/api/v1/studies/${studyUid}`),
  getImages: (studyUid: string) => api.get(`/api/v1/studies/${studyUid}/images`),
  getByPatient: (patientId: string) => api.get(`/api/v1/studies/patient/${patientId}/studies`),
  updatePriority: (studyUid: string, priority: string) =>
    api.put(`/api/v1/studies/${studyUid}/priority`, null, { params: { priority } }),
  list: (filters?: {
    status?: string
    priority?: string
    modality?: string
    limit?: number
    offset?: number
  }) => api.get('/api/v1/studies/', { params: filters }),
}

// Orthanc PACS API
export const orthancApi = {
  getStatus: () => api.get('/api/v1/orthanc/status'),
  searchStudies: (query: {
    patient_id?: string
    patient_name?: string
    study_date?: string
    modality?: string
    limit?: number
  }) => api.get('/api/v1/orthanc/studies/search', { params: query }),
  getStudy: (studyId: string) => api.get(`/api/v1/orthanc/studies/${studyId}`),
  downloadStudy: (studyId: string) => api.get(`/api/v1/orthanc/studies/${studyId}/download`, {
    responseType: 'blob',
  }),
  retrieveStudy: (studyId: string, modality: string) =>
    api.post(`/api/v1/orthanc/studies/${studyId}/retrieve`, null, { params: { modality } }),
  listModalities: () => api.get('/api/v1/orthanc/modalities'),
  getWorklist: () => api.get('/api/v1/orthanc/worklist'),
}

export default api
