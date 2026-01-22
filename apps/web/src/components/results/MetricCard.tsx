'use client';

import { motion } from 'framer-motion';
import type { MetricDefinition } from '@vox/shared';

interface MetricCardProps {
  metric: MetricDefinition;
  femaleScore: number;
  maleScore: number;
  femaleRaw: number;
  maleRaw: number;
  femaleName: string;
  maleName: string;
  comment?: string;
}

export function MetricCard({
  metric,
  femaleScore,
  maleScore,
  femaleRaw,
  maleRaw,
  femaleName,
  maleName,
  comment,
}: MetricCardProps) {
  const formatRaw = (value: number) => {
    if (metric.unit === '%') return `${value.toFixed(1)}%`;
    if (metric.unit === 'wpm') return `${Math.round(value)} wpm`;
    if (metric.unit === 'sec') return `${value.toFixed(1)} sec`;
    if (metric.unit === 'words') return `${value.toFixed(1)} words`;
    return value.toFixed(2);
  };

  return (
    <motion.div
      className="glass rounded-xl p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-white">{metric.nameRu}</h4>
          <p className="text-gray-500 text-xs">{metric.description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Female */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-female-400">{femaleName}</span>
            <span className="text-gray-400 font-mono">{formatRaw(femaleRaw)}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-female-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${femaleScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Male */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-male-400">{maleName}</span>
            <span className="text-gray-400 font-mono">{formatRaw(maleRaw)}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-male-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${maleScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
        </div>
      </div>

      {comment && (
        <p className="mt-4 text-gray-400 text-sm border-t border-white/5 pt-4">
          {comment}
        </p>
      )}
    </motion.div>
  );
}

