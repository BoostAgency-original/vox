import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { toFile } from 'openai';
import type { WordTimestamp } from '@vox/shared';

export interface TranscriptionResult {
  text: string;
  words: WordTimestamp[];
  duration: number;
}

@Injectable()
export class WhisperService {
  constructor(private readonly openaiService: OpenaiService) {}

  async transcribe(audioBuffer: Buffer, filename: string): Promise<TranscriptionResult> {
    const client = this.openaiService.getClient();

    console.log(`[Whisper] Transcribing: ${filename}, buffer size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)}MB`);

    // Use OpenAI SDK's toFile helper with explicit content type
    const ext = filename.split('.').pop()?.toLowerCase() || 'webm';
    const contentType = {
      mp3: 'audio/mpeg',
      mp4: 'audio/mp4',
      m4a: 'audio/mp4',
      wav: 'audio/wav',
      webm: 'audio/webm',
      ogg: 'audio/ogg',
      flac: 'audio/flac',
    }[ext] || 'audio/mpeg';

    const file = await toFile(audioBuffer, filename, { type: contentType });

    const response = await client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
      language: 'ru',
    });

    // Extract words with timestamps
    const words: WordTimestamp[] = (response as any).words?.map((w: any) => ({
      word: w.word,
      start: w.start,
      end: w.end,
    })) || [];

    // Calculate total duration
    const duration = words.length > 0 
      ? words[words.length - 1].end 
      : (response as any).duration || 0;

    return {
      text: response.text,
      words,
      duration,
    };
  }
}

