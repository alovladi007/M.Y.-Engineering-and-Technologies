import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('patent_auth');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          Cookies.remove('patent_auth');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: any) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
  }

  // Matter endpoints
  async getMatters() {
    const response = await this.client.get('/matters');
    return response.data;
  }

  async getMatter(id: string) {
    const response = await this.client.get(`/matters/${id}`);
    return response.data;
  }

  async createMatter(data: any) {
    const response = await this.client.post('/matters', data);
    return response.data;
  }

  async updateMatter(id: string, data: any) {
    const response = await this.client.patch(`/matters/${id}`, data);
    return response.data;
  }

  // Claims endpoints
  async getClaims(matterId: string) {
    const response = await this.client.get(`/matters/${matterId}/claims`);
    return response.data;
  }

  async updateClaims(matterId: string, claims: any[]) {
    const response = await this.client.put(`/matters/${matterId}/claims`, { claims });
    return response.data;
  }

  // Agent endpoints
  async createAgentRun(matterId: string, goals: string[]) {
    const response = await this.client.post('/agent/runs', { matter_id: matterId, goals });
    return response.data;
  }

  async getAgentRun(runId: string) {
    const response = await this.client.get(`/agent/runs/${runId}`);
    return response.data;
  }

  // File upload
  async uploadFile(file: File, matterId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('matterId', matterId);

    const response = await this.client.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Prior art
  async getPriorArt(matterId: string) {
    const response = await this.client.get(`/matters/${matterId}/prior-art`);
    return response.data;
  }

  async addPriorArt(matterId: string, data: any) {
    const response = await this.client.post(`/matters/${matterId}/prior-art`, data);
    return response.data;
  }

  // Forms
  async generateForm(matterId: string, formType: string) {
    const response = await this.client.post(`/matters/${matterId}/forms/${formType}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request(config);
    return response.data;
  }
}

export const apiClient = new ApiClient();