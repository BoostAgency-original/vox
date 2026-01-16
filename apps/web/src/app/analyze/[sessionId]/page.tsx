'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AudioRecorder } from '@/components/recording/AudioRecorder';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function AnalyzePage({ params }: PageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  
  const [session, setSession] = useState<any>(null);
  const [femaleRecorded, setFemaleRecorded] = useState(false);
  const [maleRecorded, setMaleRecorded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSession(sessionId)
      .then(setSession)
      .catch(() => setError('Сессия не найдена'));
  }, [sessionId]);

  const handleRecordingComplete = async (gender: 'female' | 'male', blob: Blob) => {
    try {
      await api.uploadRecording(sessionId, gender, blob);
      if (gender === 'female') {
        setFemaleRecorded(true);
      } else {
        setMaleRecorded(true);
      }
    } catch (err) {
      setError('Не удалось загрузить запись');
    }
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await api.startAnalysis(sessionId);
      // Redirect to results page
      router.push(`/results/${sessionId}`);
    } catch (err) {
      setError('Не удалось запустить анализ');
      setIsAnalyzing(false);
    }
  };

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Ошибка</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="audio-wave text-gray-400">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
    );
  }


  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-gradient-female">V</span>
            <span className="text-white">o</span>
            <span className="text-gradient-male">x</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Шаг 1: Запишите голосовые сообщения
          </p>
        </div>
      </header>

      {/* Instructions */}
      <div className="py-6 px-4 bg-white/[0.02] border-b border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-300">
            Запишите 1-3 минуты спонтанной речи. Расскажите о себе так, 
            как будто вы на первом свидании. Говорите естественно!
          </p>
        </div>
      </div>

      {/* Split Screen */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-200px)]">
        {/* Female Side */}
        <motion.div
          className="flex-1 p-6 lg:p-12 bg-gradient-to-br from-female-900/20 to-transparent border-b lg:border-b-0 lg:border-r border-female-500/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">👩</span>
              <h2 className="text-2xl font-bold text-female-400">
                {session.femaleName || 'Она'}
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Её голосовое сообщение
              </p>
            </div>

            <AudioRecorder
              gender="female"
              isRecorded={femaleRecorded}
              onRecordingComplete={(blob) => handleRecordingComplete('female', blob)}
            />
          </div>
        </motion.div>

        {/* Male Side */}
        <motion.div
          className="flex-1 p-6 lg:p-12 bg-gradient-to-bl from-male-900/20 to-transparent"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">👨</span>
              <h2 className="text-2xl font-bold text-male-400">
                {session.maleName || 'Он'}
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Его голосовое сообщение
              </p>
            </div>

            <AudioRecorder
              gender="male"
              isRecorded={maleRecorded}
              onRecordingComplete={(blob) => handleRecordingComplete('male', blob)}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Action */}
      {femaleRecorded && maleRecorded && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0f]/90 backdrop-blur border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-md mx-auto">
            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}
            <button
              onClick={handleStartAnalysis}
              className="w-full py-4 bg-gradient-to-r from-female-500 to-male-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Запустить анализ совместимости
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
}

