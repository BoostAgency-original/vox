import type { Session } from './session';
import type { RawMetrics, NormalizedScores } from './recording';

export interface AdminLoginDto {
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  expiresAt: string;
}

export interface AdminSessionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: 'createdAt' | 'email' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedSessions {
  data: AdminSessionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminSessionItem {
  id: string;
  email: string;
  femaleName: string | null;
  maleName: string | null;
  status: string;
  comfortFm: number | null;
  comfortMf: number | null;
  interestFm: number | null;
  interestMf: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminMetricsDetail {
  raw: RawMetrics | null;
  normalized: NormalizedScores | null;
  transcription: string | null;
  wordCount?: number;
  duration?: number;
}

export interface AdminSessionDetail extends AdminSessionItem {
  femaleMetrics: AdminMetricsDetail | null;
  maleMetrics: AdminMetricsDetail | null;
  interpretation: {
    summary: string;
    herWithHim: string;
    himWithHer: string;
  } | null;
}

export interface AdminStats {
  totalSessions: number;
  completedSessions: number;
  analyzingSessions: number;
  failedSessions: number;
  todaySessions: number;
  weekSessions: number;
}

export interface ExportQuery {
  type: 'contacts' | 'full';
  format?: 'csv' | 'json';
}

