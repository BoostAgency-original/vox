import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import type { LexicalAnalysisResult, ParameterComparison, RawMetrics } from '@vox/shared';
import { getComfortCategory, getInterestCategory } from '@vox/shared';

@Injectable()
export class GptService {
  constructor(private readonly openaiService: OpenaiService) {}

  /**
   * Анализ лексики транскрипта
   */
  async analyzeLexicon(transcription: string): Promise<LexicalAnalysisResult> {
    const client = this.openaiService.getClient();

    const response = await client.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        {
          role: 'system',
          content: `You are a speech analysis expert. Analyze the speech transcript and return JSON with results.

IMPORTANT: All responses must be in English only.

Determine:
1. lexicalDiversity - lexical diversity coefficient (TTR: unique words / total words), number from 0 to 1
2. fillerWordsCount - count of filler words (um, uh, like, you know, basically, actually, literally, I mean, sort of, kind of, right, well)
3. fillerWordsList - list of found filler words
4. profanityCount - count of profane/swear words
5. expressiveCount - count of emotionally intense expressions (hate, love, awesome, terrible, amazing, etc.)
6. uniqueWords - count of unique words (in base form)
7. totalWords - total word count

Return ONLY valid JSON without markdown.`,
        },
        {
          role: 'user',
          content: transcription,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(content) as LexicalAnalysisResult;
    } catch {
      // Fallback values
      return {
        lexicalDiversity: 0.5,
        fillerWordsCount: 0,
        fillerWordsList: [],
        profanityCount: 0,
        expressiveCount: 0,
        uniqueWords: 0,
        totalWords: 0,
      };
    }
  }

  /**
   * Генерация текстовых интерпретаций
   */
  async generateInterpretation(data: {
    femaleName: string;
    maleName: string;
    femaleRaw: RawMetrics;
    maleRaw: RawMetrics;
    comfortFm: number;
    comfortMf: number;
    interestFm: number;
    interestMf: number;
  }): Promise<{
    summary: string;
    herWithHim: string;
    himWithHer: string;
    parametersComparison: ParameterComparison[];
  }> {
    const client = this.openaiService.getClient();

    // Получаем текстовые категории
    const comfortFmCat = getComfortCategory(data.comfortFm);
    const comfortMfCat = getComfortCategory(data.comfortMf);
    const interestFmCat = getInterestCategory(data.interestFm);
    const interestMfCat = getInterestCategory(data.interestMf);

    const response = await client.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        {
          role: 'system',
          content: `Ты эксперт по анализу совместимости пар на основе стиля речи. Создай ДЕТАЛЬНЫЕ персонализированные интерпретации.

СЫРЫЕ МЕТРИКИ РЕЧИ (с единицами измерения):
• speechSpeed — темп речи (слов/мин, норма ~120)
• lexicalRichness — богатство словаря (0-1, норма ~0.5)
• pauseDensity — плотность пауз (% времени в паузах)
• pauseDepth — глубина пауз (секунды, максимальная пауза)
• repetitionMax — повторы (максимальная частота одного слова)
• fillerRatio — слова-паразиты (% от всех слов)
• harshnessRatio — резкость (% грубой/резкой лексики)
• phraseLength — длина фраз (слов между паузами)

ПРАВИЛА ИНТЕРПРЕТАЦИИ:
1. КОМФОРТ определяется схожестью по "спокойным" осям (паузы, чистота речи, резкость):
   - 0-39%: низкий — непросто друг с другом
   - 40-59%: средний — нужна адаптация
   - 60-79%: повышенный — спокойно и предсказуемо
   - 80-100%: очень высокий — на одной волне

2. ИНТЕРЕС определяется различиями по "драйвовым" осям (темп, лексика, фразы, эмоциональность):
   - 0-39%: низкий — маловероятно будет особо интересно
   - 40-59%: умеренный — есть потенциал
   - 60-79%: заметный — скорее всего будете интересны друг другу
   - 80-100%: сильный — притяжение и драйв

3. ВАЖНО: В текстах НЕ используй числа и проценты! Пиши описательно.

СТРУКТУРА herWithHim и himWithHer (ОБЯЗАТЕЛЬНО 3-4 АБЗАЦА каждый):

АБЗАЦ 1 - ОБЩЕЕ ОЩУЩЕНИЕ:
Начни с общего впечатления от общения. Как будет ощущаться разговор? Спокойно/напряжённо/динамично?

АБЗАЦ 2 - КОНКРЕТНЫЕ РАЗЛИЧИЯ:
Детально разбери ключевые различия по метрикам:
- Темп и ритм: кто быстрее говорит, как это влияет
- Паузы: кто делает больше пауз, как это воспринимается
- Словарь: чья речь богаче, что это даёт

АБЗАЦ 3 - ЭМОЦИОНАЛЬНАЯ ДИНАМИКА:
- Чистота речи: есть ли слова-паразиты, как это влияет на восприятие
- Резкость: кто мягче/резче в выражениях
- Как это влияет на близость и понимание

АБЗАЦ 4 - РИСКИ И РЕКОМЕНДАЦИИ:
- Возможные точки напряжения
- Что может помочь улучшить коммуникацию
- Конкретные советы для этой пары

ФОРМАТ ОТВЕТА (JSON):
{
  "summary": "Краткий вердикт в 2-3 предложения о паре в целом.",
  "herWithHim": "МИНИМУМ 3-4 развёрнутых абзаца. Пиши от второго лица: 'Тебе с ним...'. Разбирай каждый аспект детально.",
  "himWithHer": "МИНИМУМ 3-4 развёрнутых абзаца. Пиши: 'Ему с тобой...'. Объясни его перспективу детально.",
  "parametersComparison": [
    {"parameter": "speechSpeed", "comment": "1-2 предложения о различии в темпе и что это значит практически"},
    {"parameter": "lexicalRichness", "comment": "..."},
    {"parameter": "pauseDensity", "comment": "..."},
    {"parameter": "pauseDepth", "comment": "..."},
    {"parameter": "repetitionMax", "comment": "..."},
    {"parameter": "fillerRatio", "comment": "..."},
    {"parameter": "harshnessRatio", "comment": "..."},
    {"parameter": "phraseLength", "comment": "..."}
  ]
}

ВАЖНО:
- herWithHim и himWithHer должны быть ДЕТАЛЬНЫМИ (минимум 800-1000 символов каждый)
- НЕ ВСТАВЛЯЙ ЧИСЛА! Числа показаны в UI отдельно
- Пиши конкретно про ЭТУ пару, не общие фразы
- Используй имена участников
- Style: warm, specific, practical

CRITICAL: All text output (summary, herWithHim, himWithHer, comments) MUST be in English only.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            femaleName: data.femaleName,
            maleName: data.maleName,
            femaleRaw: data.femaleRaw,
            maleRaw: data.maleRaw,
            compatibility: {
              herWithHim: { comfort: data.comfortFm, comfortCat: comfortFmCat, interest: data.interestFm, interestCat: interestFmCat },
              himWithHer: { comfort: data.comfortMf, comfortCat: comfortMfCat, interest: data.interestMf, interestCat: interestMfCat },
            },
          }),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_completion_tokens: 5000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(content);
    } catch {
      return {
        summary: 'Failed to generate interpretation.',
        herWithHim: '',
        himWithHer: '',
        parametersComparison: [],
      };
    }
  }
}

