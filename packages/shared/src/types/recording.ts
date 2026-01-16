export type Gender = 'female' | 'male';

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface Recording {
  id: string;
  sessionId: string;
  gender: Gender;
  audioUrl: string;
  durationSeconds: number | null;
  transcription: string | null;
  wordTimestamps: WordTimestamp[] | null;
  rawMetrics: RawMetrics | null;
  normalizedScores: NormalizedScores | null;
  createdAt: string;
}

export interface RawMetrics {
  speechSpeed: number;        // слов/мин
  lexicalRichness: number;    // TTR (0-1)
  pauseDensity: number;       // % времени в паузах
  pauseDepth: number;         // макс пауза в секундах
  repetitionMax: number;      // макс повторов подряд
  fillerRatio: number;        // % слов-паразитов
  harshnessRatio: number;     // % грубой лексики
  phraseLength: number;       // среднее слов между паузами
}

export interface NormalizedScores {
  speechSpeed: number;        // 0-100
  lexicalRichness: number;
  pauseDensity: number;
  pauseDepth: number;
  repetitionMax: number;
  fillerRatio: number;
  harshnessRatio: number;
  phraseLength: number;
}

export interface UploadRecordingDto {
  sessionId: string;
  gender: Gender;
  // file: File (multipart)
}

