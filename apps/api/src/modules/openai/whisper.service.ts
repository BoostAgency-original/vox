import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import type { WordTimestamp } from '@vox/shared';
import { toFile } from 'openai';

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

    const sizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);
    console.log(`[Whisper] Transcribing: ${filename}, size: ${sizeMB}MB`);

    // Determine MIME type from extension
    const ext = filename.split('.').pop()?.toLowerCase() || 'webm';
    const mimeTypes: Record<string, string> = {
      'webm': 'audio/webm',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'm4a': 'audio/mp4',
      'mp4': 'audio/mp4',
    };
    const mimeType = mimeTypes[ext] || 'audio/webm';

    // Use OpenAI's toFile utility for reliable multipart upload
    const file = await toFile(audioBuffer, filename, { type: mimeType });
    console.log(`[Whisper] Created file object: ${filename}, type: ${mimeType}`);

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

      console.log(`[Whisper] Transcription complete: ${words.length} words, ${duration.toFixed(1)}s`);

      return {
        text: response.text,
        words,
        duration,
      };
  }
}
