import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenaiService } from './openai.service';
import { WhisperService } from './whisper.service';
import { GptService } from './gpt.service';

@Module({
  imports: [ConfigModule],
  providers: [OpenaiService, WhisperService, GptService],
  exports: [OpenaiService, WhisperService, GptService],
})
export class OpenaiModule {}

