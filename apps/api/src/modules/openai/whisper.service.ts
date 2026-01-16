import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import type { WordTimestamp } from '@vox/shared';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuid } from 'uuid';

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

    // Write buffer to temp file and use fs.createReadStream
    // This is more reliable for OpenAI SDK
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `whisper-${uuid()}-${filename}`);
    
    try {
      fs.writeFileSync(tempFile, audioBuffer);
      console.log(`[Whisper] Temp file created: ${tempFile}`);

      const response = await client.audio.transcriptions.create({
        file: fs.createReadStream(tempFile),
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
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
        console.log(`[Whisper] Temp file deleted: ${tempFile}`);
      }
    }
  }
}
