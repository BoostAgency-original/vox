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

    // Convert buffer to File-like object for OpenAI SDK
    const file = await toFile(audioBuffer, filename);

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

