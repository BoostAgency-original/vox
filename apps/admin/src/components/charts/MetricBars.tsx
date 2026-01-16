'use client';

import { motion } from 'framer-motion';
import type { NormalizedScores } from '@vox/shared';
import { cn } from '@/lib/utils';

interface MetricBarsProps {
  metrics: NormalizedScores;
  labels: Record<string, string>;
  color: 'female' | 'male';
}

export function MetricBars({ metrics, labels, color }: MetricBarsProps) {
  const colorClasses = {
    female: {
      bar: 'bg-female-500',
      text: 'text-female-400',
    },
    male: {
      bar: 'bg-male-500',
      text: 'text-male-400',
    },
  };

  const entries = Object.entries(metrics).filter(
    ([key]) => typeof metrics[key as keyof NormalizedScores] === 'number'
  );

  return (
    <div className="space-y-3">
      {entries.map(([key, value], index) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">{labels[key] || key}</span>
            <span className={cn('font-mono', colorClasses[color].text)}>
              {typeof value === 'number' ? value.toFixed(0) : '—'}
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', colorClasses[color].bar)}
              initial={{ width: 0 }}
              animate={{ width: `${typeof value === 'number' ? Math.min(100, Math.max(0, value)) : 0}%` }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

