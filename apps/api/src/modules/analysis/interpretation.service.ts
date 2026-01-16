import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interpretation } from '../../database/entities/interpretation.entity';
import { GptService } from '../openai/gpt.service';
import type { NormalizedScores, RawMetrics, ParameterComparison } from '@vox/shared';

@Injectable()
export class InterpretationService {
  constructor(
    @InjectRepository(Interpretation)
    private readonly interpretationRepository: Repository<Interpretation>,
    private readonly gptService: GptService,
  ) {}

  async generate(data: {
    sessionId: string;
    femaleName: string;
    maleName: string;
    femaleScores: NormalizedScores;
    maleScores: NormalizedScores;
    femaleRaw: RawMetrics;
    maleRaw: RawMetrics;
    comfortFm: number;
    comfortMf: number;
    interestFm: number;
    interestMf: number;
  }): Promise<Interpretation> {
    // Generate using GPT
    const generated = await this.gptService.generateInterpretation({
      femaleName: data.femaleName,
      maleName: data.maleName,
      femaleRaw: data.femaleRaw,
      maleRaw: data.maleRaw,
      comfortFm: data.comfortFm,
      comfortMf: data.comfortMf,
      interestFm: data.interestFm,
      interestMf: data.interestMf,
    });

    // Save to database
    const interpretation = this.interpretationRepository.create({
      sessionId: data.sessionId,
      summary: generated.summary,
      herWithHim: generated.herWithHim,
      himWithHer: generated.himWithHer,
      parametersComparison: generated.parametersComparison || [],
    });

    return this.interpretationRepository.save(interpretation);
  }

  async findBySession(sessionId: string): Promise<Interpretation | null> {
    return this.interpretationRepository.findOne({
      where: { sessionId },
    });
  }
}

