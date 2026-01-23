'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, isMobile: false });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setDimensions({
          width,
          isMobile: width < 500,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const data = Object.keys(LABELS).map((key) => ({
    metric: LABELS[key],
    female: femaleScores[key as keyof NormalizedScores],
    male: maleScores[key as keyof NormalizedScores],
  }));

  // Dynamic sizing based on container width
  const { isMobile, width } = dimensions;
  
  // Calculate outer radius - scales with container, but capped
  const outerRadius = isMobile 
    ? Math.min(width * 0.32, 120)
    : "75%";

  // Margins for labels
  const margin = isMobile
    ? { top: 25, right: 29, bottom: 20, left: 29 }
    : { top: 5, right: 5, bottom: 5, left: 5 };

  // Font size scales with width on mobile
  const fontSize = isMobile ? Math.max(9, Math.min(11, width / 40)) : 12;

  // Chart height (without legend)
  const chartHeight = isMobile ? Math.max(280, Math.min(340, width * 0.85)) : 400;

  return (
    <div ref={containerRef} className="w-full">
      {/* Chart */}
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart 
            data={data}
            cx="50%"
            cy={isMobile ? "48%" : "50%"}
            outerRadius={outerRadius}
            margin={margin}
          >
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#9ca3af', fontSize }}
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
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend - outside the chart container */}
      <div className={`flex items-center justify-center gap-6 ${isMobile ? 'mt-4' : 'mt-5'}`}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#ec4899]" />
          <span className="text-gray-300 text-sm">{femaleName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#3b82f6]" />
          <span className="text-gray-300 text-sm">{maleName}</span>
        </div>
      </div>
    </div>
  );
}
