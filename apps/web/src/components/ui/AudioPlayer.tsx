'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  variant?: 'female' | 'male' | 'neutral';
  className?: string;
}

export function AudioPlayer({ src, variant = 'neutral', className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let durationFixed = false;
    let isFixingDuration = false; // флаг workaround'а

    const setValidDuration = (dur: number) => {
      if (isFinite(dur) && dur > 0 && !durationFixed) {
        setDuration(dur);
        durationFixed = true;
      }
    };

    const handleLoadedMetadata = () => {
      setIsLoaded(true);
      if (isFinite(audio.duration) && audio.duration > 0) {
        setValidDuration(audio.duration);
      } else {
        // Workaround для WebM: устанавливаем большое значение currentTime,
        // чтобы браузер вычислил реальную длительность
        isFixingDuration = true;
        audio.currentTime = 1e10;
      }
    };

    const handleDurationChange = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setValidDuration(audio.duration);
        // После получения duration сбрасываем на начало
        if (isFixingDuration) {
          audio.currentTime = 0;
        }
      }
    };

    const handleSeeked = () => {
      // Когда seek завершился после workaround - сбрасываем флаг
      if (isFixingDuration && durationFixed) {
        isFixingDuration = false;
        setCurrentTime(0);
      }
    };

    const handleTimeUpdate = () => {
      // Игнорируем timeupdate пока идёт workaround
      if (isFixingDuration) return;
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('seeked', handleSeeked);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // If already loaded
    if (audio.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('seeked', handleSeeked);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress || !duration || !isFinite(duration)) return;

    const rect = progress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    
    if (isFinite(newTime)) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const colors = {
    female: {
      bg: 'bg-female-500/10',
      progress: 'bg-female-500',
      button: 'bg-female-500 hover:bg-female-600',
      text: 'text-female-400',
    },
    male: {
      bg: 'bg-male-500/10',
      progress: 'bg-male-500',
      button: 'bg-male-500 hover:bg-male-600',
      text: 'text-male-400',
    },
    neutral: {
      bg: 'bg-white/5',
      progress: 'bg-white',
      button: 'bg-white/20 hover:bg-white/30',
      text: 'text-gray-400',
    },
  }[variant];

  return (
    <div className={cn('rounded-xl p-4', colors.bg, className)}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <motion.button
          onClick={togglePlay}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
            colors.button
          )}
          whileTap={{ scale: 0.95 }}
          disabled={!isLoaded}
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>

        {/* Progress */}
        <div className="flex-1">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-2 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
          >
            <motion.div
              className={cn('h-full rounded-full', colors.progress)}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
            {/* Knob */}
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg',
                colors.progress
              )}
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          
          {/* Time */}
          <div className="flex justify-between mt-1">
            <span className={cn('text-xs font-mono', colors.text)}>
              {formatTime(currentTime)}
            </span>
            <span className="text-xs font-mono text-gray-500">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

