import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WordTimestamp } from '@vox/shared';

export interface TranscriptionResult {
  text: string;
  words: WordTimestamp[];
  duration: number;
}

@Injectable()
export class WhisperService {
  private apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get('OPENAI_API_KEY') || '';
  }

  async transcribe(audioBuffer: Buffer, filename: string): Promise<TranscriptionResult> {
    const sizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);
    console.log(`[Whisper] Transcribing: ${filename}, size: ${sizeMB}MB`);

    if (!this.apiKey) {
      throw new BadRequestException('OpenAI API key not configured');
    }

    // Determine MIME type from extension
    const ext = filename.split('.').pop()?.toLowerCase() || 'webm';
    const mimeTypes: Record<string, string> = {
      'webm': 'audio/webm',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'm4a': 'audio/mp4',
      'mp4': 'audio/mp4',
      'mpeg': 'audio/mpeg',
      'mpga': 'audio/mpeg',
    };
    const mimeType = mimeTypes[ext] || 'audio/webm';

    // Use native FormData and Blob for reliable multipart upload
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');
    formData.append('language', 'ru');

    console.log(`[Whisper] Sending request: ${filename}, type: ${mimeType}, size: ${sizeMB}MB`);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Whisper] API error: ${response.status} ${errorText}`);
      throw new BadRequestException(`Whisper API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract words with timestamps
    const words: WordTimestamp[] = data.words?.map((w: any) => ({
      word: w.word,
      start: w.start,
      end: w.end,
    })) || [];

    // Calculate total duration
    const duration = words.length > 0 
      ? words[words.length - 1].end 
      : data.duration || 0;

    console.log(`[Whisper] Transcription complete: ${words.length} words, ${duration.toFixed(1)}s`);

    return {
      text: data.text,
      words,
      duration,
    };
  }
}
