/**
 * Параметры речи для анализа
 */
export interface MetricDefinition {
  id: string;
  nameRu: string;
  nameEn: string;
  description: string;
  unit: string;
}

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    id: 'speechSpeed',
    nameRu: 'Скорость речи',
    nameEn: 'Speech Speed',
    description: 'Количество слов в минуту',
    unit: 'сл/мин',
  },
  {
    id: 'lexicalRichness',
    nameRu: 'Богатство словаря',
    nameEn: 'Lexical Richness',
    description: 'Разнообразие используемых слов',
    unit: '',
  },
  {
    id: 'pauseDensity',
    nameRu: 'Плотность пауз',
    nameEn: 'Pause Density',
    description: 'Процент времени в паузах',
    unit: '%',
  },
  {
    id: 'pauseDepth',
    nameRu: 'Глубина пауз',
    nameEn: 'Pause Depth',
    description: 'Максимальная длительность паузы',
    unit: 'сек',
  },
  {
    id: 'repetitionMax',
    nameRu: 'Склонность к повторам',
    nameEn: 'Repetition Tendency',
    description: 'Максимум повторов одного слова подряд',
    unit: '',
  },
  {
    id: 'fillerRatio',
    nameRu: 'Чистота речи',
    nameEn: 'Speech Cleanliness',
    description: 'Процент слов-паразитов',
    unit: '%',
  },
  {
    id: 'harshnessRatio',
    nameRu: 'Эмоциональная резкость',
    nameEn: 'Emotional Harshness',
    description: 'Процент грубой/экспрессивной лексики',
    unit: '%',
  },
  {
    id: 'phraseLength',
    nameRu: 'Длина фразы',
    nameEn: 'Phrase Length',
    description: 'Среднее количество слов между паузами',
    unit: 'слов',
  },
];

/**
 * Популяционные статистики для нормализации (μ и σ)
 * Эти значения будут уточняться по мере накопления данных
 */
export interface PopulationStats {
  mean: number;
  std: number;
}

export const DEFAULT_POPULATION_STATS: Record<string, PopulationStats> = {
  speechSpeed: { mean: 120, std: 30 },
  lexicalRichness: { mean: 0.5, std: 0.15 },
  pauseDensity: { mean: 25, std: 10 },
  pauseDepth: { mean: 2.0, std: 1.0 },
  repetitionMax: { mean: 4, std: 2 },  // Теперь считаем макс. частоту слова
  fillerRatio: { mean: 5, std: 3 },
  harshnessRatio: { mean: 1, std: 2 },
  phraseLength: { mean: 8, std: 3 },
};

