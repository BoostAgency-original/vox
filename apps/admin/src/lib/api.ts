import type { 
  AdminSessionsQuery,
  PaginatedSessions,
  AdminSessionDetail,
  AdminStats,
} from '@vox/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class AdminApiClient {
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

  async login(password: string): Promise<{ token: string; expiresAt: string }> {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async logout(): Promise<void> {
    return this.request('/admin/logout', {
      method: 'POST',
    });
  }

  async getStats(): Promise<AdminStats> {
    return this.request('/admin/stats');
  }

  async getSessions(params?: AdminSessionsQuery): Promise<PaginatedSessions> {
    if (params) {
      const cleanParams: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = String(value);
        }
      });
      const query = Object.keys(cleanParams).length > 0 
        ? `?${new URLSearchParams(cleanParams).toString()}` 
        : '';
      return this.request(`/admin/sessions${query}`);
    }
    return this.request('/admin/sessions');
  }

  async getSessionDetail(id: string): Promise<AdminSessionDetail> {
    return this.request(`/admin/sessions/${id}`);
  }

  getExportUrl(type: 'contacts' | 'full'): string {
    return `${this.baseUrl}/api/admin/export?type=${type}`;
  }
}

export const api = new AdminApiClient(API_URL);

