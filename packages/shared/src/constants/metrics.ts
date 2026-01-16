/**
 * Порог паузы в секундах (паузы короче не считаются значимыми)
 */
export const PAUSE_THRESHOLD_SECONDS = 0.25;

/**
 * Минимальная длина паузы для "глубокой" паузы
 */
export const DEEP_PAUSE_THRESHOLD_SECONDS = 1.0;

/**
 * Слова-паразиты (русский язык)
 */
export const FILLER_WORDS_RU = [
  'э',
  'эм',
  'ээ',
  'эээ',
  'ну',
  'как бы',
  'типа',
  'короче',
  'значит',
  'вот',
  'это',
  'это самое',
  'так сказать',
  'в общем',
  'в принципе',
  'на самом деле',
  'понимаешь',
  'слушай',
  'знаешь',
  'блин',
  'ладно',
  'окей',
  'ок',
];

/**
 * Веса для расчёта комфорта
 */
export const COMFORT_WEIGHTS = {
  pauseDensity: 0.3,
  pauseDepth: 0.25,
  fillerRatio: 0.25,
  harshnessRatio: 0.2,
};

/**
 * Веса для расчёта интереса/драйва
 */
export const DRIVE_WEIGHTS = {
  speechSpeed: 0.3,
  lexicalRichness: 0.3,
  phraseLength: 0.25,
  harshnessRatio: 0.15,
};

/**
 * Параметры для расчёта новизны (novelty)
 */
export const NOVELTY_PARAMS = {
  minDelta: 10,   // Минимальное различие для интереса
  peakDelta: 35,  // Оптимальное различие
  maxDelta: 70,   // Максимальное различие (после него - отторжение)
};

/**
 * Текстовые категории для комфорта
 */
export const COMFORT_CATEGORIES = {
  veryLow: { max: 39, label: 'низкий комфорт', description: 'вам может быть непросто друг с другом' },
  medium: { max: 59, label: 'средний комфорт', description: 'адаптация потребует времени' },
  high: { max: 79, label: 'повышенный комфорт', description: 'вам будет спокойно и предсказуемо' },
  veryHigh: { max: 100, label: 'очень высокий комфорт', description: 'вы на одной волне' },
};

/**
 * Текстовые категории для интереса
 */
export const INTEREST_CATEGORIES = {
  veryLow: { max: 39, label: 'низкий интерес', description: 'маловероятно, что будет особо интересно' },
  medium: { max: 59, label: 'умеренный интерес', description: 'есть потенциал для развития' },
  high: { max: 79, label: 'заметный интерес', description: 'вы, скорее всего, будете интересны друг другу' },
  veryHigh: { max: 100, label: 'сильный интерес', description: 'сильное притяжение и драйв' },
};

/**
 * Получить категорию комфорта по значению
 */
export function getComfortCategory(value: number): { label: string; description: string } {
  if (value <= 39) return COMFORT_CATEGORIES.veryLow;
  if (value <= 59) return COMFORT_CATEGORIES.medium;
  if (value <= 79) return COMFORT_CATEGORIES.high;
  return COMFORT_CATEGORIES.veryHigh;
}

/**
 * Получить категорию интереса по значению
 */
export function getInterestCategory(value: number): { label: string; description: string } {
  if (value <= 39) return INTEREST_CATEGORIES.veryLow;
  if (value <= 59) return INTEREST_CATEGORIES.medium;
  if (value <= 79) return INTEREST_CATEGORIES.high;
  return INTEREST_CATEGORIES.veryHigh;
}

