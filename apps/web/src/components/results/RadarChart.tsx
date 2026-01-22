'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { NormalizedScores } from '@vox/shared';

interface RadarChartProps {
  femaleScores: NormalizedScores;
  maleScores: NormalizedScores;
  femaleName: string;
  maleName: string;
}

const LABELS: Record<string, string> = {
  speechSpeed: 'Pace',
  lexicalRichness: 'Vocabulary',
  pauseDensity: 'Pauses',
  pauseDepth: 'Pause Depth',
  repetitionMax: 'Repetitions',
  fillerRatio: 'Filler Words',
  harshnessRatio: 'Intensity',
  phraseLength: 'Phrase Length',
};

export function RadarChart({ femaleScores, maleScores, femaleName, maleName }: RadarChartProps) {
  const data = Object.keys(LABELS).map((key) => ({
    metric: LABELS[key],
    female: femaleScores[key as keyof NormalizedScores],
    male: maleScores[key as keyof NormalizedScores],
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name={femaleName}
            dataKey="female"
            stroke="#ec4899"
            fill="#ec4899"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name={maleName}
            dataKey="male"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-gray-300">{value}</span>}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

