import type { 
  CreateSessionDto, 
  Session, 
  AnalysisResult,
} from '@vox/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Sessions
  async createSession(data: CreateSessionDto): Promise<{ id: string; status: string; analyzeUrl: string }> {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSession(id: string): Promise<Session> {
    return this.request(`/sessions/${id}`);
  }

  async getSessionStatus(id: string): Promise<{ id: string; status: string }> {
    return this.request(`/sessions/${id}/status`);
  }

  // Recordings
  async uploadRecording(
    sessionId: string,
    gender: 'female' | 'male',
    file: Blob,
  ): Promise<{ id: string; sessionId: string; gender: string; audioUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, `${gender}.webm`);
    formData.append('sessionId', sessionId);
    formData.append('gender', gender);

    const url = `${this.baseUrl}/api/recordings`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Analysis
  async startAnalysis(sessionId: string): Promise<{ sessionId: string; status: string; message: string }> {
    return this.request(`/analysis/${sessionId}`, {
      method: 'POST',
    });
  }

  async getResults(sessionId: string): Promise<AnalysisResult> {
    return this.request(`/analysis/results/${sessionId}`);
  }
}

export const api = new ApiClient(API_URL);
