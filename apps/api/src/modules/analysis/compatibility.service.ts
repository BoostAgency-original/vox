import { Injectable } from '@nestjs/common';
import type { NormalizedScores, CompatibilityResult } from '@vox/shared';
import { COMFORT_WEIGHTS, DRIVE_WEIGHTS, NOVELTY_PARAMS } from '@vox/shared';

@Injectable()
export class CompatibilityService {
  /**
   * Расчёт совместимости между двумя людьми
   */
  calculate(
    femaleScores: NormalizedScores,
    maleScores: NormalizedScores,
  ): CompatibilityResult {
    // Комфорт: насколько похожи + насколько B в норме
    const comfortFm = this.calculateComfort(femaleScores, maleScores);
    const comfortMf = this.calculateComfort(maleScores, femaleScores);

    // Интерес: новизна + комфорт с учётом предпочтения новизны
    const interestFm = this.calculateInterest(femaleScores, maleScores, comfortFm);
    const interestMf = this.calculateInterest(maleScores, femaleScores, comfortMf);

    return {
      comfortFm: Math.round(comfortFm),
      comfortMf: Math.round(comfortMf),
      interestFm: Math.round(interestFm),
      interestMf: Math.round(interestMf),
    };
  }

  /**
   * Комфорт A с B = 0.5 * BaseComfort(B) + 0.5 * SimilarityComfort(A←B)
   */
  private calculateComfort(scoresA: NormalizedScores, scoresB: NormalizedScores): number {
    const comfortAxes = ['pauseDensity', 'pauseDepth', 'fillerRatio', 'harshnessRatio'] as const;

    // BaseComfort(B) - насколько B в норме
    let baseComfort = 0;
    for (const axis of comfortAxes) {
      const weight = COMFORT_WEIGHTS[axis] || 0.25;
      const zB = this.scoreToZ(scoresB[axis]);
      const norm = Math.max(0, 1 - Math.abs(zB) / 3);
      baseComfort += weight * norm;
    }

    // SimilarityComfort - насколько похожи
    let similarityComfort = 0;
    for (const axis of comfortAxes) {
      const weight = COMFORT_WEIGHTS[axis] || 0.25;
      const delta = Math.abs(scoresA[axis] - scoresB[axis]);
      const similarity = 1 - Math.min(delta, 100) / 100;
      similarityComfort += weight * similarity;
    }

    // Комбинируем
    const comfort = 0.5 * baseComfort + 0.5 * similarityComfort;
    return comfort * 100;
  }

  /**
   * Интерес = NoveltyPreference(A) * BaseDrive + (1 - NoveltyPreference(A)) * Comfort
   */
  private calculateInterest(
    scoresA: NormalizedScores,
    scoresB: NormalizedScores,
    comfortAB: number,
  ): number {
    const driveAxes = ['speechSpeed', 'lexicalRichness', 'phraseLength', 'harshnessRatio'] as const;

    // BaseDrive - новизна по осям драйва
    let baseDrive = 0;
    for (const axis of driveAxes) {
      const weight = DRIVE_WEIGHTS[axis] || 0.25;
      const delta = Math.abs(scoresA[axis] - scoresB[axis]);
      const novelty = this.calculateNovelty(delta);
      baseDrive += weight * novelty;
    }

    // NoveltyPreference(A) - любовь к новизне
    const noveltyPref = this.calculateNoveltyPreference(scoresA);

    // Комбинируем
    const interest = noveltyPref * baseDrive + (1 - noveltyPref) * (comfortAB / 100);
    return interest * 100;
  }

  /**
   * Новизна максимальна при умеренном различии
   */
  private calculateNovelty(delta: number): number {
    const { minDelta, peakDelta, maxDelta } = NOVELTY_PARAMS;

    if (delta <= minDelta) {
      return 0;
    } else if (delta <= peakDelta) {
      return (delta - minDelta) / (peakDelta - minDelta);
    } else if (delta <= maxDelta) {
      return 1 - (delta - peakDelta) / (maxDelta - peakDelta);
    } else {
      return 0;
    }
  }

  /**
   * Склонность к новизне на основе собственных метрик
   */
  private calculateNoveltyPreference(scores: NormalizedScores): number {
    const zSpeed = this.scoreToZ(scores.speechSpeed);
    const zLex = this.scoreToZ(scores.lexicalRichness);
    const zPhrase = this.scoreToZ(scores.phraseLength);
    const zExpress = this.scoreToZ(scores.harshnessRatio);

    const pref = 0.5 + 0.1 * zSpeed + 0.1 * zLex + 0.1 * zPhrase + 0.1 * zExpress;
    return Math.max(0, Math.min(1, pref));
  }

  /**
   * Преобразование 0-100 обратно в z-score
   */
  private scoreToZ(score: number): number {
    return (score / 100) * 6 - 3;
  }
}

