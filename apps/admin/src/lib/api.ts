import type { 
  AdminSessionsQuery,
  PaginatedSessions,
  AdminSessionDetail,
  AdminStats,
} from '@vox/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'admin_token';

class AdminApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(password: string): Promise<{ token: string; expiresAt: string }> {
    const result = await this.request<{ token: string; expiresAt: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    this.setToken(result.token);
    return result;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/admin/logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
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
    const token = this.getToken();
    return `${this.baseUrl}/api/admin/export?type=${type}&token=${token}`;
  }
}

export const api = new AdminApiClient(API_URL);
