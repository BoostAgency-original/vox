export type SessionStatus = 'pending' | 'uploading' | 'analyzing' | 'complete' | 'failed';

export interface Session {
  id: string;
  email: string;
  femaleName: string | null;
  maleName: string | null;
  status: SessionStatus;
  comfortFm: number | null;
  comfortMf: number | null;
  interestFm: number | null;
  interestMf: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateSessionDto {
  email: string;
  femaleName: string;
  maleName: string;
}

export interface SessionResponse {
  id: string;
  status: SessionStatus;
  analyzeUrl: string;
}

