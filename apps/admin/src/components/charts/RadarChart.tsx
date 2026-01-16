'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { NormalizedScores } from '@vox/shared';

interface RadarChartProps {
  femaleScores: NormalizedScores;
  maleScores: NormalizedScores;
  femaleName: string;
  maleName: string;
}

const LABELS: Record<string, string> = {
  speechSpeed: 'Темп',
  lexicalRichness: 'Лексика',
  pauseDensity: 'Паузы',
  pauseDepth: 'Глубина пауз',
  repetitionMax: 'Повторы',
  fillerRatio: 'Паразиты',
  harshnessRatio: 'Резкость',
  phraseLength: 'Длина фраз',
};

const FULL_LABELS: Record<string, string> = {
  speechSpeed: 'Темп речи',
  lexicalRichness: 'Лексическое богатство',
  pauseDensity: 'Плотность пауз',
  pauseDepth: 'Глубина пауз',
  repetitionMax: 'Склонность к повторам',
  fillerRatio: 'Слова-паразиты',
  harshnessRatio: 'Резкость',
  phraseLength: 'Длина фраз',
};

export function RadarChart({ femaleScores, maleScores, femaleName, maleName }: RadarChartProps) {
  const data = Object.keys(LABELS).map((key) => ({
    metric: LABELS[key],
    fullName: FULL_LABELS[key],
    female: femaleScores[key as keyof NormalizedScores] || 0,
    male: maleScores[key as keyof NormalizedScores] || 0,
  }));

  return (
    <div className="w-full h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name={femaleName}
            dataKey="female"
            stroke="#ec4899"
            fill="#ec4899"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name={maleName}
            dataKey="male"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-medium mb-2">{data.fullName}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-female-400">
                        {femaleName}: <span className="font-mono">{data.female.toFixed(0)}</span>
                      </p>
                      <p className="text-male-400">
                        {maleName}: <span className="font-mono">{data.male.toFixed(0)}</span>
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-gray-300 text-sm">{value}</span>}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

