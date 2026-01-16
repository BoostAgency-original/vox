'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { AdminSessionDetail } from '@vox/shared';
import { RadarChart } from '@/components/charts/RadarChart';
import { MetricBars } from '@/components/charts/MetricBars';
import { CompatibilityGauge } from '@/components/charts/CompatibilityGauge';

interface PageProps {
  params: Promise<{ id: string }>;
}

type Tab = 'overview' | 'metrics' | 'charts' | 'transcription';

export default function SessionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<AdminSessionDetail | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    api.getSessionDetail(id)
      .then(setSession)
      .catch(() => router.push('/'));
  }, [id, router]);

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="audio-wave text-gray-400">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-500/20 text-gray-400',
    uploading: 'bg-yellow-500/20 text-yellow-400',
    analyzing: 'bg-blue-500/20 text-blue-400',
    complete: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Ожидание',
    uploading: 'Загрузка',
    analyzing: 'Анализ',
    complete: 'Завершено',
    failed: 'Ошибка',
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Обзор', icon: '📋' },
    { id: 'metrics', label: 'Метрики', icon: '📊' },
    { id: 'charts', label: 'Диаграммы', icon: '📈' },
    { id: 'transcription', label: 'Транскрипции', icon: '📝' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard" 
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          ← Назад
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-white">Сессия #{id.slice(0, 8)}</span>
      </div>

      {/* Header */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{session.email}</h1>
              <span className={`px-2 py-1 rounded text-xs ${statusColors[session.status]}`}>
                {statusLabels[session.status]}
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <span className="text-female-400">👩 {session.femaleName || 'Не указано'}</span>
              <span className="text-male-400">👨 {session.maleName || 'Не указано'}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <p className="text-gray-400 text-sm">
              Создано: {new Date(session.createdAt).toLocaleString('ru-RU')}
            </p>
            {session.completedAt && (
              <p className="text-gray-400 text-sm">
                Завершено: {new Date(session.completedAt).toLocaleString('ru-RU')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <OverviewTab session={session} />
        )}
        {activeTab === 'metrics' && (
          <MetricsTab session={session} />
        )}
        {activeTab === 'charts' && (
          <ChartsTab session={session} />
        )}
        {activeTab === 'transcription' && (
          <TranscriptionTab session={session} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ session }: { session: AdminSessionDetail }) {
  if (session.status !== 'complete') {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-gray-400">Анализ ещё не завершён</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compatibility Scores */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-female-400 mb-4 flex items-center gap-2">
            <span>👩</span> Ей с ним
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-female-500/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Комфорт</p>
              <p className="text-3xl font-bold text-white">{session.comfortFm}%</p>
            </div>
            <div className="bg-female-500/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Интерес</p>
              <p className="text-3xl font-bold text-white">{session.interestFm}%</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-male-400 mb-4 flex items-center gap-2">
            <span>👨</span> Ему с ней
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-male-500/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Комфорт</p>
              <p className="text-3xl font-bold text-white">{session.comfortMf}%</p>
            </div>
            <div className="bg-male-500/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Интерес</p>
              <p className="text-3xl font-bold text-white">{session.interestMf}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      {session.interpretation && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Интерпретация</h3>
          
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <p className="text-gray-400 text-sm mb-1">Вердикт</p>
            <p className="text-white">{session.interpretation.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-l-2 border-female-500 pl-4">
              <p className="text-female-400 text-sm font-medium mb-2">Ей с ним</p>
              <p className="text-gray-300 text-sm whitespace-pre-line">
                {session.interpretation.herWithHim}
              </p>
            </div>
            <div className="border-l-2 border-male-500 pl-4">
              <p className="text-male-400 text-sm font-medium mb-2">Ему с ней</p>
              <p className="text-gray-300 text-sm whitespace-pre-line">
                {session.interpretation.himWithHer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricsTab({ session }: { session: AdminSessionDetail }) {
  const { femaleMetrics, maleMetrics } = session;

  if (!femaleMetrics?.normalized && !maleMetrics?.normalized) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-gray-400">Метрики недоступны</p>
      </div>
    );
  }

  const metricLabels: Record<string, string> = {
    speechSpeed: 'Темп речи',
    lexicalRichness: 'Лексическое богатство',
    pauseDensity: 'Плотность пауз',
    pauseDepth: 'Глубина пауз',
    repetitionMax: 'Склонность к повторам',
    fillerRatio: 'Слова-паразиты',
    harshnessRatio: 'Резкость',
    phraseLength: 'Длина фраз',
  };

  return (
    <div className="space-y-6">
      {/* Raw Metrics */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Сырые метрики</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {femaleMetrics?.raw && (
            <div>
              <p className="text-female-400 font-medium mb-3 flex items-center gap-2">
                <span>👩</span> {session.femaleName}
              </p>
              <div className="space-y-2 text-sm">
                {Object.entries(femaleMetrics.raw).map(([key, value]) => (
                  <div key={key} className="flex justify-between bg-white/5 px-3 py-2 rounded">
                    <span className="text-gray-400">{metricLabels[key] || key}</span>
                    <span className="text-white font-mono">
                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {maleMetrics?.raw && (
            <div>
              <p className="text-male-400 font-medium mb-3 flex items-center gap-2">
                <span>👨</span> {session.maleName}
              </p>
              <div className="space-y-2 text-sm">
                {Object.entries(maleMetrics.raw).map(([key, value]) => (
                  <div key={key} className="flex justify-between bg-white/5 px-3 py-2 rounded">
                    <span className="text-gray-400">{metricLabels[key] || key}</span>
                    <span className="text-white font-mono">
                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Normalized Metrics */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Нормализованные метрики (0-100)</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {femaleMetrics?.normalized && (
            <div>
              <p className="text-female-400 font-medium mb-3 flex items-center gap-2">
                <span>👩</span> {session.femaleName}
              </p>
              <MetricBars 
                metrics={femaleMetrics.normalized} 
                labels={metricLabels}
                color="female"
              />
            </div>
          )}
          {maleMetrics?.normalized && (
            <div>
              <p className="text-male-400 font-medium mb-3 flex items-center gap-2">
                <span>👨</span> {session.maleName}
              </p>
              <MetricBars 
                metrics={maleMetrics.normalized} 
                labels={metricLabels}
                color="male"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartsTab({ session }: { session: AdminSessionDetail }) {
  const { femaleMetrics, maleMetrics } = session;

  if (!femaleMetrics?.normalized || !maleMetrics?.normalized) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-gray-400">Диаграммы недоступны</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Октаграмма сравнения</h3>
        <RadarChart
          femaleScores={femaleMetrics.normalized}
          maleScores={maleMetrics.normalized}
          femaleName={session.femaleName || 'Она'}
          maleName={session.maleName || 'Он'}
        />
      </div>

      {/* Compatibility Gauges */}
      {session.status === 'complete' && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Показатели совместимости</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CompatibilityGauge 
              value={session.comfortFm || 0} 
              label="Комфорт (ей)"
              color="female"
            />
            <CompatibilityGauge 
              value={session.interestFm || 0} 
              label="Интерес (ей)"
              color="female"
            />
            <CompatibilityGauge 
              value={session.comfortMf || 0} 
              label="Комфорт (ему)"
              color="male"
            />
            <CompatibilityGauge 
              value={session.interestMf || 0} 
              label="Интерес (ему)"
              color="male"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TranscriptionTab({ session }: { session: AdminSessionDetail }) {
  const { femaleMetrics, maleMetrics } = session;

  if (!femaleMetrics?.transcription && !maleMetrics?.transcription) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-gray-400">Транскрипции недоступны</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {femaleMetrics?.transcription && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-female-400 mb-4 flex items-center gap-2">
            <span>👩</span> {session.femaleName || 'Она'}
          </h3>
          <div className="bg-white/5 rounded-lg p-4 max-h-80 overflow-y-auto">
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {femaleMetrics.transcription}
            </p>
          </div>
          {femaleMetrics.wordCount && (
            <p className="text-gray-500 text-xs mt-2">
              Слов: {femaleMetrics.wordCount} | Длительность: {femaleMetrics.duration?.toFixed(1)}с
            </p>
          )}
        </div>
      )}

      {maleMetrics?.transcription && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-male-400 mb-4 flex items-center gap-2">
            <span>👨</span> {session.maleName || 'Он'}
          </h3>
          <div className="bg-white/5 rounded-lg p-4 max-h-80 overflow-y-auto">
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {maleMetrics.transcription}
            </p>
          </div>
          {maleMetrics.wordCount && (
            <p className="text-gray-500 text-xs mt-2">
              Слов: {maleMetrics.wordCount} | Длительность: {maleMetrics.duration?.toFixed(1)}с
            </p>
          )}
        </div>
      )}
    </div>
  );
}

