'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { RadarChart } from '@/components/results/RadarChart';
import type { AnalysisResult } from '@vox/shared';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

// Категории (без цветов)
function getComfortLabel(value: number): string {
  if (value <= 39) return 'низкий';
  if (value <= 59) return 'средний';
  if (value <= 79) return 'повышенный';
  return 'очень высокий';
}

function getInterestLabel(value: number): string {
  if (value <= 39) return 'низкий';
  if (value <= 59) return 'умеренный';
  if (value <= 79) return 'выше среднего';
  return 'высокий';
}

// Названия метрик
const METRIC_NAMES: Record<string, { name: string; unit: string; description: string }> = {
  speechSpeed: { name: 'Темп речи', unit: 'сл/мин', description: 'Скорость речи' },
  lexicalRichness: { name: 'Богатство словаря', unit: '', description: 'Разнообразие лексики' },
  pauseDensity: { name: 'Плотность пауз', unit: '%', description: 'Время в паузах' },
  pauseDepth: { name: 'Глубина пауз', unit: 'сек', description: 'Макс. длительность паузы' },
  repetitionMax: { name: 'Склонность к повторам', unit: '', description: 'Повторы слов подряд' },
  fillerRatio: { name: 'Чистота речи', unit: '%', description: 'Слова-паразиты' },
  harshnessRatio: { name: 'Эмоциональная резкость', unit: '%', description: 'Грубая/резкая лексика' },
  phraseLength: { name: 'Длина фразы', unit: 'слов', description: 'Слов между паузами' },
};

/**
 * Расчёт процента заполнения шкалы для конкретной метрики
 */
function getBarPercent(metricId: string, femaleRaw: number, maleRaw: number, isForFemale: boolean): number {
  const value = isForFemale ? femaleRaw : maleRaw;
  
  switch (metricId) {
    // Относительные метрики — шкала относительно максимума из двух
    case 'speechSpeed':
    case 'pauseDepth':
    case 'phraseLength':
    case 'repetitionMax': {
      const max = Math.max(femaleRaw, maleRaw);
      return max > 0 ? (value / max) * 100 : 0;
    }
    
    // Процентные метрики — значение само по себе уже в процентах (0-100)
    case 'pauseDensity':
    case 'fillerRatio':
    case 'harshnessRatio': {
      return Math.min(value, 100);
    }
    
    // Индекс 0-1 → умножаем на 100
    case 'lexicalRichness': {
      return Math.min(value * 100, 100);
    }
    
    default:
      return 50;
  }
}

export default function ResultsPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<'loading' | 'analyzing' | 'complete' | 'error'>('loading');

  useEffect(() => {
    const checkResults = async () => {
      try {
        const data = await api.getResults(sessionId);
        setResults(data);
        setStatus('complete');
      } catch (err: any) {
        try {
          const session = await api.getSessionStatus(sessionId);
          if (session.status === 'analyzing') {
            setStatus('analyzing');
            setTimeout(checkResults, 3000);
          } else if (session.status === 'failed') {
            setStatus('error');
          } else if (session.status === 'complete') {
            setTimeout(checkResults, 1000);
          } else {
            setStatus('error');
          }
        } catch {
          setStatus('error');
        }
      }
    };

    checkResults();
  }, [sessionId]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Ошибка</h1>
          <p className="text-gray-400">Не удалось получить результаты анализа</p>
        </div>
      </div>
    );
  }

  if (status === 'analyzing' || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-female-500 to-male-500 animate-pulse" />
          <h1 className="text-2xl font-bold text-white mb-4">
            {status === 'loading' ? 'Загрузка...' : 'Анализируем ваши голоса'}
          </h1>
          <p className="text-gray-400">
            Это займёт 1-2 минуты. Страница обновится автоматически.
          </p>
          <div className="mt-8 audio-wave text-gray-400 justify-center flex">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-gradient-female">V</span>
            <span className="text-white">o</span>
            <span className="text-gradient-male">x</span>
          </h1>
        </div>
      </header>

      {/* Names */}
      <div className="py-8 px-4 text-center border-b border-white/5">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          Совместимость по стилю речи
        </h2>
        <div className="flex items-center justify-center gap-4">
          <span className="text-xl font-bold text-female-400">{results.female.name}</span>
          <span className="text-gray-500">&</span>
          <span className="text-xl font-bold text-male-400">{results.male.name}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* === 1. ВЕРХНИЙ БЛОК: 4 индикатора со шкалами === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Тебе с ним */}
          <div className="glass rounded-2xl p-6 bg-gradient-to-br from-female-900/30 to-transparent">
            <h3 className="text-lg font-semibold text-female-400 mb-6">
              Тебе с ним
            </h3>
            <div className="space-y-6">
              {/* Комфорт */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Комфорт</span>
                  <span className="text-white font-mono font-bold">{Math.round(Number(results.compatibility.comfortFm))}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-female-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(Number(results.compatibility.comfortFm))}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">{getComfortLabel(Number(results.compatibility.comfortFm))}</p>
              </div>
              {/* Интерес */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Интерес</span>
                  <span className="text-white font-mono font-bold">{Math.round(Number(results.compatibility.interestFm))}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-female-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(Number(results.compatibility.interestFm))}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">{getInterestLabel(Number(results.compatibility.interestFm))}</p>
              </div>
            </div>
          </div>

          {/* Ему с тобой */}
          <div className="glass rounded-2xl p-6 bg-gradient-to-br from-male-900/30 to-transparent">
            <h3 className="text-lg font-semibold text-male-400 mb-6">
              Ему с тобой
            </h3>
            <div className="space-y-6">
              {/* Комфорт */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Комфорт</span>
                  <span className="text-white font-mono font-bold">{Math.round(Number(results.compatibility.comfortMf))}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-male-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(Number(results.compatibility.comfortMf))}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">{getComfortLabel(Number(results.compatibility.comfortMf))}</p>
              </div>
              {/* Интерес */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Интерес</span>
                  <span className="text-white font-mono font-bold">{Math.round(Number(results.compatibility.interestMf))}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-male-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(Number(results.compatibility.interestMf))}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">{getInterestLabel(Number(results.compatibility.interestMf))}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Краткий вердикт */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Краткий вердикт</h3>
          <p className="text-gray-300 leading-relaxed">
            {results.interpretation.summary}
          </p>
        </motion.div>

        {/* === 2. ЛИЧНЫЕ КОММЕНТАРИИ === */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Тебе с ним */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 border-l-4 border-female-500"
          >
            <h3 className="text-lg font-semibold text-female-400 mb-4">
              Тебе с ним
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {results.interpretation.herWithHim}
            </p>
          </motion.div>

          {/* Ему с тобой */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 border-l-4 border-male-500"
          >
            <h3 className="text-lg font-semibold text-male-400 mb-4">
              Ему с тобой
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {results.interpretation.himWithHer}
            </p>
          </motion.div>
        </div>

        {/* === 3. ОКТАГРАММА === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6 text-center">
            Сравнение по параметрам
          </h3>
          <RadarChart
            femaleScores={results.female.normalizedScores}
            maleScores={results.male.normalizedScores}
            femaleName={results.female.name}
            maleName={results.male.name}
          />
        </motion.div>

        {/* === 4. ТАБЛИЦА ПАРАМЕТРОВ === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Ваш стиль общения по параметрам
          </h3>

          {results.interpretation.parametersComparison?.map((param, idx) => {
            const meta = METRIC_NAMES[param.parameter] || { name: param.parameter, unit: '', description: '' };
            const femaleRaw = results.female.rawMetrics[param.parameter as keyof typeof results.female.rawMetrics];
            const maleRaw = results.male.rawMetrics[param.parameter as keyof typeof results.male.rawMetrics];
            
            // Используем правильный расчёт процента для шкалы
            const femaleBarPercent = getBarPercent(param.parameter, femaleRaw, maleRaw, true);
            const maleBarPercent = getBarPercent(param.parameter, femaleRaw, maleRaw, false);

            const formatValue = (val: number, metricId: string) => {
              // Богатство словаря: 0-1 → показываем как 0-100
              if (metricId === 'lexicalRichness') return Math.round((val || 0) * 100);
              // Проценты: без знака %, округляем до целых
              if (meta.unit === '%') return Math.round(val || 0);
              if (meta.unit === 'сек') return `${(val || 0).toFixed(1)} сек`;
              if (meta.unit === 'сл/мин') return `${Math.round(val || 0)} сл/мин`;
              if (meta.unit === 'слов') return `${(val || 0).toFixed(1)} слов`;
              // Повторы — целое число
              if (metricId === 'repetitionMax') return Math.round(val || 0);
              return Math.round(val || 0);
            };

            return (
              <motion.div
                key={param.parameter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                className="glass rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-white">{meta.name}</h4>
                    <p className="text-gray-500 text-xs">{meta.description}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Ты */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-female-400">Ты</span>
                      <span className="text-gray-400 font-mono">{formatValue(femaleRaw, param.parameter)}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-female-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${femaleBarPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Он */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-male-400">Он</span>
                      <span className="text-gray-400 font-mono">{formatValue(maleRaw, param.parameter)}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-male-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${maleBarPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Комментарий */}
                {param.comment && (
                  <div className="border-t border-white/5 pt-4">
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {param.comment}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </main>
  );
}
