'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CompatibilityGaugeProps {
  value: number;
  label: string;
  color: 'female' | 'male';
}

export function CompatibilityGauge({ value, label, color }: CompatibilityGaugeProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  
  const colorClasses = {
    female: {
      stroke: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.2)',
      text: 'text-female-400',
    },
    male: {
      stroke: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.2)',
      text: 'text-male-400',
    },
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (numValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={colorClasses[color].bg}
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={colorClasses[color].stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{numValue.toFixed(0)}%</span>
        </div>
      </div>
      <p className={cn('text-sm mt-2', colorClasses[color].text)}>{label}</p>
    </div>
  );
}

