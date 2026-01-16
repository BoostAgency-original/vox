'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CompatibilityScoreProps {
  title: string;
  comfort: number;
  interest: number;
  gender: 'female' | 'male';
}

function getComfortLabel(score: number): string {
  if (score >= 80) return 'Очень высокий';
  if (score >= 60) return 'Высокий';
  if (score >= 40) return 'Средний';
  return 'Низкий';
}

function getInterestLabel(score: number): string {
  if (score >= 80) return 'Сильный';
  if (score >= 60) return 'Выше среднего';
  if (score >= 40) return 'Умеренный';
  return 'Низкий';
}

export function CompatibilityScore({ title, comfort, interest, gender }: CompatibilityScoreProps) {
  const isFemale = gender === 'female';
  const bgClass = isFemale ? 'from-female-900/30' : 'from-male-900/30';
  const accentColor = isFemale ? 'female' : 'male';

  return (
    <motion.div
      className={cn(
        'glass rounded-2xl p-6 bg-gradient-to-br to-transparent',
        bgClass
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className={cn(
        'text-lg font-semibold mb-6',
        isFemale ? 'text-female-400' : 'text-male-400'
      )}>
        {title}
      </h3>

      <div className="space-y-6">
        {/* Comfort */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Комфорт</span>
            <span className="text-white font-mono font-bold">{comfort}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                isFemale ? 'bg-female-500' : 'bg-male-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${comfort}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">
            {getComfortLabel(comfort)}
          </p>
        </div>

        {/* Interest */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Интерес</span>
            <span className="text-white font-mono font-bold">{interest}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                isFemale ? 'bg-female-400' : 'bg-male-400'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${interest}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">
            {getInterestLabel(interest)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

