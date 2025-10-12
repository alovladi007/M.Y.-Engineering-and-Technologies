import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const orgId = localStorage.getItem('orgId')
  if (orgId) {
    config.headers['X-Org-Id'] = orgId
  }

  return config
})

// Auth
export const auth = {
  getGoogleAuthUrl: () => api.get('/auth/oauth/google'),
  getGitHubAuthUrl: () => api.get('/auth/oauth/github'),
  callback: (code: string, provider: string) =>
    api.post('/auth/oauth/callback', { code, provider }),
  getCurrentUser: () => api.get('/auth/me'),
}

// Topologies
export const topologies = {
  list: () => api.get('/sim/topologies/list'),
  simulate: (data: any) => api.post('/sim/topologies/simulate', data),
  getRun: (runId: number) => api.get(`/sim/topologies/run/${runId}`),
  getWaveforms: (runId: number) => api.get(`/sim/topologies/run/${runId}/waveforms`),
}

// Users
export const users = {
  me: () => api.get('/users/me'),
  list: () => api.get('/users'),
  get: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
}

// Organizations
export const orgs = {
  list: () => api.get('/orgs'),
  create: (data: any) => api.post('/orgs', data),
  get: (id: number) => api.get(`/orgs/${id}`),
  listMembers: (orgId: number) => api.get(`/orgs/${orgId}/members`),
  inviteMember: (orgId: number, data: any) => api.post(`/orgs/${orgId}/members`, data),
  removeMember: (orgId: number, userId: number) =>
    api.delete(`/orgs/${orgId}/members/${userId}`),
}

// Projects
export const projects = {
  list: () => api.get('/projects'),
  create: (data: any) => api.post('/projects', data),
  get: (id: number) => api.get(`/projects/${id}`),
  update: (id: number, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
}

// Runs
export const runs = {
  list: (params?: any) => api.get('/runs', { params }),
  get: (id: number) => api.get(`/runs/${id}`),
  delete: (id: number) => api.delete(`/runs/${id}`),
  cancel: (id: number) => api.post(`/runs/${id}/cancel`),
  getArtifacts: (id: number) => api.get(`/runs/${id}/artifacts`),
}

// ZVS Analysis
export const zvs = {
  check: (data: any) => api.post('/sim/zvs/check', data),
  boundary: (data: any) => api.post('/sim/zvs/boundary', data),
  map: (data: any) => api.post('/sim/zvs/map', data),
  optimize: (data: any) => api.post('/sim/zvs/optimize', data),
  getRunMap: (runId: number) => api.get(`/sim/zvs/run/${runId}/map`),
}

// Devices
export const devices = {
  list: (technology?: string) =>
    api.get('/sim/devices/list', { params: { technology } }),
  get: (name: string) => api.get(`/sim/devices/get/${name}`),
  search: (params: any) => api.post('/sim/devices/search', params),
  recommend: (params: any) => api.post('/sim/devices/recommend', params),
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/sim/devices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  listTechnologies: () => api.get('/sim/devices/technologies'),
}

// HIL
export const hil = {
  connect: (data: any) => api.post('/sim/hil/connect', data),
  configure: (data: any) => api.post('/sim/hil/configure', data),
  start: (data: any) => api.post('/sim/hil/start', data),
  stop: (sessionId: string) => api.post('/sim/hil/stop', { session_id: sessionId }),
  getTelemetry: (sessionId: string) => api.get(`/sim/hil/telemetry/${sessionId}`),
  writeSetpoints: (data: any) => api.post('/sim/hil/setpoints', data),
  disconnect: (sessionId: string) =>
    api.post('/sim/hil/disconnect', { session_id: sessionId }),
  listSessions: () => api.get('/sim/hil/sessions'),
}

// Compliance
export const compliance = {
  listRulesets: () => api.get('/compliance/rulesets'),
  getRuleset: (name: string) => api.get(`/compliance/rulesets/${name}`),
  check: (data: any) => api.post('/compliance/check', data),
  getReport: (reportId: number) => api.get(`/compliance/reports/${reportId}`),
  getRunReports: (runId: number) => api.get(`/compliance/run/${runId}/reports`),
  deleteReport: (reportId: number) => api.delete(`/compliance/reports/${reportId}`),
}

// Reports
export const reports = {
  generate: (data: any) => api.post('/reports/generate', data),
  download: (artifactId: number) => api.get(`/reports/download/${artifactId}`),
  listTemplates: () => api.get('/reports/templates'),
}

// Files
export const files = {
  upload: (file: File, runId?: number, artifactType?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (runId) formData.append('run_id', runId.toString())
    if (artifactType) formData.append('artifact_type', artifactType)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  download: (fileId: string) => api.get(`/files/download/${fileId}`),
  delete: (fileId: string) => api.delete(`/files/${fileId}`),
}

export default api
