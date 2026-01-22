'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { AudioRecorder } from '@/components/recording/AudioRecorder';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function AnalyzePage({ params }: PageProps) {
  const { sessionId } = use(params);
  
  const [session, setSession] = useState<any>(null);
  const [femaleRecorded, setFemaleRecorded] = useState(false);
  const [maleRecorded, setMaleRecorded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSession(sessionId)
      .then(setSession)
      .catch(() => setError('Session not found'));
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
      setError('Failed to upload recording');
    }
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await api.startAnalysis(sessionId);
      // Show confirmation instead of redirect
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to start analysis');
      setIsAnalyzing(false);
    }
  };

  // Confirmation screen
  if (isSubmitted && session) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Icon */}
          <motion.div
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-female-500 to-male-500 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
          >
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Analysis Started!
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-gray-400 text-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            We're analyzing your voice recordings. This usually takes 2-5 minutes.
          </motion.p>

          {/* Email notification */}
          <motion.div
            className="glass rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg
                className="w-6 h-6 text-female-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-white font-medium">Check your email</span>
            </div>
            <p className="text-gray-400 text-sm">
              Results will be sent to <span className="text-white">{session.email}</span>
            </p>
          </motion.div>

          {/* Info */}
          <motion.p
            className="text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            You can close this page now. We'll email you when results are ready.
          </motion.p>

          {/* Processing animation */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="audio-wave text-gray-500">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <span className="text-gray-500 text-sm">Processing...</span>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
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
            Step 1: Record voice messages
          </p>
        </div>
      </header>

      {/* Instructions */}
      <div className="py-6 px-4 bg-white/[0.02] border-b border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-300">
            Record 1-3 minutes of spontaneous speech. Talk about yourself as if 
            you were on a first date. Speak naturally!
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
                {session.femaleName || 'Her'}
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Her voice message
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
                {session.maleName || 'Him'}
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                His voice message
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
              disabled={isAnalyzing}
              className="w-full py-4 bg-gradient-to-r from-female-500 to-male-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Starting Analysis...' : 'Start Compatibility Analysis'}
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
}
