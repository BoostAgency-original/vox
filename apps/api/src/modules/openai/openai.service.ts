import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  getClient(): OpenAI {
    return this.client;
  }
}

