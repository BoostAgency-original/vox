import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { WhisperService } from './whisper.service';
import { GptService } from './gpt.service';

@Module({
  providers: [OpenaiService, WhisperService, GptService],
  exports: [OpenaiService, WhisperService, GptService],
})
export class OpenaiModule {}

