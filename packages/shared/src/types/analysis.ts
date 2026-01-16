import type { NormalizedScores, RawMetrics } from './recording';

/**
 * Результат анализа совместимости
 */
export interface CompatibilityResult {
  comfortFm: number;   // Комфорт: ей с ним (0-100)
  comfortMf: number;   // Комфорт: ему с ней (0-100)
  interestFm: number;  // Интерес: ей с ним (0-100)
  interestMf: number;  // Интерес: ему с ней (0-100)
}

/**
 * Текстовые интерпретации
 */
export interface Interpretation {
  summary: string;                     // Краткий вердикт
  herWithHim: string;                  // "Тебе с ним: ..."
  himWithHer: string;                  // "Ему с тобой: ..."
  parametersComparison: ParameterComparison[];
}

export interface ParameterComparison {
  parameter: string;        // ID метрики (speechSpeed, etc)
  femaleValue: number;      // Нормализованное значение 0-100
  maleValue: number;        // Нормализованное значение 0-100
  comment: string;          // Комментарий для пользователя
}

/**
 * Полный результат анализа для UI
 */
export interface AnalysisResult {
  sessionId: string;
  status: 'complete' | 'failed';
  
  // Участники
  female: {
    name: string;
    rawMetrics: RawMetrics;
    normalizedScores: NormalizedScores;
  };
  male: {
    name: string;
    rawMetrics: RawMetrics;
    normalizedScores: NormalizedScores;
  };
  
  // Совместимость
  compatibility: CompatibilityResult;
  
  // Интерпретации
  interpretation: Interpretation;
  
  // Meta
  completedAt: string;
}

/**
 * Результат анализа лексики от GPT
 */
export interface LexicalAnalysisResult {
  lexicalDiversity: number;        // TTR индекс (0-1)
  fillerWordsCount: number;
  fillerWordsList: string[];
  profanityCount: number;
  expressiveCount: number;
  uniqueWords: number;
  totalWords: number;
}

