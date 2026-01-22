'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AudioPlayer } from '@/components/ui/AudioPlayer';

interface AudioRecorderProps {
  gender: 'female' | 'male';
  isRecorded: boolean;
  onRecordingComplete: (blob: Blob) => void;
}

export function AudioRecorder({ gender, isRecorded, onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFromFile, setIsFromFile] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFemale = gender === 'female';

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsFromFile(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    // Check file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      alert('File is too large. Maximum 25MB');
      return;
    }

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setIsFromFile(true);
    setRecordingTime(0);
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;
    
    setIsUploading(true);
    try {
      await onRecordingComplete(audioBlob);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsFromFile(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecorded) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className={cn(
          'w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4',
          isFemale ? 'bg-female-500/20' : 'bg-male-500/20'
        )}>
          <svg className={cn('w-10 h-10', isFemale ? 'text-female-400' : 'text-male-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className={cn('font-medium', isFemale ? 'text-female-400' : 'text-male-400')}>
          Recording uploaded ✓
        </p>
      </motion.div>
    );
  }

  if (audioUrl) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-gray-400 text-sm text-center">
            {isFromFile ? 'Listen to the file before submitting' : 'Listen to the recording before submitting'}
          </p>
          <AudioPlayer src={audioUrl} variant={gender} />
          {!isFromFile && recordingTime > 0 && (
            <p className="text-center text-gray-500 text-sm">
              Duration: {formatTime(recordingTime)}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex-1 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            {isFromFile ? 'Choose another' : 'Re-record'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className={cn(
              'flex-1 py-3 text-white font-medium rounded-xl transition-opacity disabled:opacity-50',
              isFemale ? 'bg-female-500 hover:bg-female-600' : 'bg-male-500 hover:bg-male-600'
            )}
          >
            {isUploading ? 'Uploading...' : 'Submit'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
        onChange={handleFileSelect}
        className="hidden"
      />

      <motion.button
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          'w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all',
          isRecording
            ? 'bg-red-500 recording-indicator'
            : isFemale
              ? 'bg-female-500/20 hover:bg-female-500/30 border-2 border-female-500/50'
              : 'bg-male-500/20 hover:bg-male-500/30 border-2 border-male-500/50'
        )}
        whileTap={{ scale: 0.95 }}
      >
        {isRecording ? (
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className={cn('w-12 h-12', isFemale ? 'text-female-400' : 'text-male-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </motion.button>

      <p className={cn(
        'mt-6 text-lg font-medium',
        isRecording ? 'text-red-400' : 'text-gray-400'
      )}>
        {isRecording ? formatTime(recordingTime) : 'Tap to record'}
      </p>

      {isRecording && (
        <p className="text-gray-500 text-sm mt-2">
          Recommended duration: 1-3 minutes
        </p>
      )}

      {!isRecording && (
        <>
          {/* Upload file button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'mt-4 px-6 py-2 rounded-full text-sm font-medium transition-colors border',
              isFemale 
                ? 'border-female-500/50 text-female-400 hover:bg-female-500/10'
                : 'border-male-500/50 text-male-400 hover:bg-male-500/10'
            )}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload MP3
            </span>
          </button>

          <div className="mt-8 text-left glass rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-2">💡 What to talk about:</p>
            <ul className="text-gray-500 text-sm space-y-1">
              <li>• Who you are and what you do</li>
              <li>• What matters in your life</li>
              <li>• How you spend your free time</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

