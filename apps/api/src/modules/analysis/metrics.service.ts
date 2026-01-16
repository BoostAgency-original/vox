import { Injectable } from '@nestjs/common';
import type { WordTimestamp, RawMetrics, NormalizedScores, LexicalAnalysisResult } from '@vox/shared';
import { 
  PAUSE_THRESHOLD_SECONDS, 
  DEFAULT_POPULATION_STATS 
} from '@vox/shared';

@Injectable()
export class MetricsService {
  /**
   * Расчёт сырых метрик из timestamps и лексического анализа
   */
  calculateRawMetrics(
    words: WordTimestamp[],
    duration: number,
    lexicalAnalysis: LexicalAnalysisResult,
  ): RawMetrics {
    if (words.length === 0) {
      return this.getEmptyMetrics();
    }

    // 1. Темп речи (слов/мин)
    // duration в секундах, переводим в минуты
    const durationMinutes = duration / 60;
    const speechSpeed = durationMinutes > 0 
      ? words.length / durationMinutes
      : 0;

    // 2. Лексическое разнообразие
    const lexicalRichness = lexicalAnalysis.lexicalDiversity;

    // 3. Паузы
    const pauses = this.extractPauses(words, duration);
    const totalPauseTime = pauses.reduce((sum, p) => sum + p, 0);
    const pauseDensity = duration > 0 ? (totalPauseTime / duration) * 100 : 0;

    // 4. Максимальная пауза
    const pauseDepth = pauses.length > 0 ? Math.max(...pauses) : 0;

    // 5. Повторы подряд
    const repetitionMax = this.calculateMaxRepetitions(words);

    // 6. Слова-паразиты
    const totalWords = lexicalAnalysis.totalWords || words.length;
    const fillerRatio = totalWords > 0 
      ? (lexicalAnalysis.fillerWordsCount / totalWords) * 100 
      : 0;

    // 7. Резкая лексика
    const harshnessRatio = totalWords > 0
      ? ((lexicalAnalysis.profanityCount + lexicalAnalysis.expressiveCount) / totalWords) * 100
      : 0;

    // 8. Средняя длина фразы
    const phraseLength = this.calculateAveragePhraseLength(words);

    return {
      speechSpeed: Math.round(speechSpeed * 10) / 10,
      lexicalRichness: Math.round(lexicalRichness * 100) / 100,
      pauseDensity: Math.round(pauseDensity * 10) / 10,
      pauseDepth: Math.round(pauseDepth * 100) / 100,
      repetitionMax,
      fillerRatio: Math.round(fillerRatio * 10) / 10,
      harshnessRatio: Math.round(harshnessRatio * 10) / 10,
      phraseLength: Math.round(phraseLength * 10) / 10,
    };
  }

  /**
   * Нормализация метрик в шкалу 0-100
   */
  normalizeMetrics(raw: RawMetrics): NormalizedScores {
    const normalize = (value: number, key: string): number => {
      const stats = DEFAULT_POPULATION_STATS[key];
      if (!stats) return 50;

      // Z-score
      const z = (value - stats.mean) / stats.std;
      
      // Clip to [-3, +3]
      const clipped = Math.max(-3, Math.min(3, z));
      
      // Convert to 0-100
      const score = ((clipped + 3) / 6) * 100;
      
      return Math.round(score);
    };

    return {
      speechSpeed: normalize(raw.speechSpeed, 'speechSpeed'),
      lexicalRichness: normalize(raw.lexicalRichness, 'lexicalRichness'),
      pauseDensity: normalize(raw.pauseDensity, 'pauseDensity'),
      pauseDepth: normalize(raw.pauseDepth, 'pauseDepth'),
      repetitionMax: normalize(raw.repetitionMax, 'repetitionMax'),
      fillerRatio: normalize(raw.fillerRatio, 'fillerRatio'),
      harshnessRatio: normalize(raw.harshnessRatio, 'harshnessRatio'),
      phraseLength: normalize(raw.phraseLength, 'phraseLength'),
    };
  }

  private calculateSpeakingTime(words: WordTimestamp[], totalDuration: number): number {
    if (words.length === 0) return 0;

    // Time actually speaking (excluding pauses)
    let speakingTime = 0;
    for (const word of words) {
      speakingTime += word.end - word.start;
    }

    return speakingTime / 60; // Convert to minutes
  }

  private extractPauses(words: WordTimestamp[], totalDuration: number): number[] {
    const pauses: number[] = [];

    // Pause at the beginning
    if (words.length > 0 && words[0].start > PAUSE_THRESHOLD_SECONDS) {
      pauses.push(words[0].start);
    }

    // Pauses between words
    for (let i = 1; i < words.length; i++) {
      const gap = words[i].start - words[i - 1].end;
      if (gap > PAUSE_THRESHOLD_SECONDS) {
        pauses.push(gap);
      }
    }

    // Pause at the end
    if (words.length > 0) {
      const endGap = totalDuration - words[words.length - 1].end;
      if (endGap > PAUSE_THRESHOLD_SECONDS) {
        pauses.push(endGap);
      }
    }

    return pauses;
  }

  private calculateMaxRepetitions(words: WordTimestamp[]): number {
    if (words.length === 0) return 0;

    // Служебные слова, которые не считаем как повторы
    const stopWords = new Set([
      'я', 'ты', 'он', 'она', 'мы', 'вы', 'они',
      'и', 'а', 'но', 'или', 'что', 'как', 'в', 'на', 'с', 'к', 'у', 'о', 'из', 'за', 'по', 'до',
      'не', 'да', 'нет', 'это', 'то', 'так', 'вот', 'ну', 'же', 'бы', 'ли',
      'его', 'её', 'их', 'мой', 'твой', 'наш', 'ваш', 'свой',
      'который', 'когда', 'где', 'если', 'чтобы', 'потому',
      'очень', 'уже', 'ещё', 'еще', 'только', 'даже', 'просто',
      'быть', 'есть', 'был', 'была', 'было', 'были', 'будет',
    ]);

    // Считаем частоту каждого слова (кроме служебных)
    const wordCounts = new Map<string, number>();
    
    for (const w of words) {
      const word = w.word.toLowerCase().replace(/[^\wа-яё]/gi, '');
      if (word.length < 3 || stopWords.has(word)) continue;
      
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }

    // Максимальное количество повторений одного слова
    let maxRepeat = 1;
    for (const count of wordCounts.values()) {
      if (count > maxRepeat) {
        maxRepeat = count;
      }
    }

    return maxRepeat;
  }

  private calculateAveragePhraseLength(words: WordTimestamp[]): number {
    if (words.length === 0) return 0;

    const phrases: number[] = [];
    let currentPhraseLength = 1;

    for (let i = 1; i < words.length; i++) {
      const gap = words[i].start - words[i - 1].end;
      
      if (gap > PAUSE_THRESHOLD_SECONDS) {
        phrases.push(currentPhraseLength);
        currentPhraseLength = 1;
      } else {
        currentPhraseLength++;
      }
    }

    // Last phrase
    phrases.push(currentPhraseLength);

    // Average
    return phrases.reduce((sum, len) => sum + len, 0) / phrases.length;
  }

  private getEmptyMetrics(): RawMetrics {
    return {
      speechSpeed: 0,
      lexicalRichness: 0,
      pauseDensity: 0,
      pauseDepth: 0,
      repetitionMax: 0,
      fillerRatio: 0,
      harshnessRatio: 0,
      phraseLength: 0,
    };
  }
}

