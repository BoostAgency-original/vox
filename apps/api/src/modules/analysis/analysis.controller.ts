import { Controller, Post, Get, Param } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post(':sessionId')
  async startAnalysis(@Param('sessionId') sessionId: string) {
    // Start analysis in background
    this.analysisService.runAnalysis(sessionId).catch((err) => {
      console.error(`Analysis failed for session ${sessionId}:`, err);
    });

    return {
      sessionId,
      status: 'analyzing',
      message: 'Анализ запущен. Результаты будут отправлены на email.',
    };
  }

  @Get('results/:sessionId')
  async getResults(@Param('sessionId') sessionId: string) {
    return this.analysisService.getResults(sessionId);
  }
}

