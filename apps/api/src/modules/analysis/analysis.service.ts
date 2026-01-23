import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../../database/entities/session.entity';
import { Recording } from '../../database/entities/recording.entity';
import { WhisperService } from '../openai/whisper.service';
import { GptService } from '../openai/gpt.service';
import { MetricsService } from './metrics.service';
import { CompatibilityService } from './compatibility.service';
import { InterpretationService } from './interpretation.service';
import { StorageService } from '../storage/storage.service';
import { SessionsService } from '../sessions/sessions.service';
import { RecordingsService } from '../recordings/recordings.service';
import { EmailService } from '../email/email.service';
import type { AnalysisResult } from '@vox/shared';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Recording)
    private readonly recordingRepository: Repository<Recording>,
    private readonly whisperService: WhisperService,
    private readonly gptService: GptService,
    private readonly metricsService: MetricsService,
    private readonly compatibilityService: CompatibilityService,
    private readonly interpretationService: InterpretationService,
    private readonly storageService: StorageService,
    private readonly sessionsService: SessionsService,
    private readonly recordingsService: RecordingsService,
    private readonly emailService: EmailService,
  ) {}

  async runAnalysis(sessionId: string): Promise<void> {
    const session = await this.sessionsService.findOne(sessionId);

    // Check both recordings exist
    const recordings = await this.recordingsService.findBySession(sessionId);
    console.log(`[Analysis] Session ${sessionId}: found ${recordings.length} recordings`, 
      recordings.map(r => ({ id: r.id, gender: r.gender })));
    
    if (recordings.length !== 2) {
      throw new BadRequestException('Both recordings are required for analysis');
    }
    
    const femaleRec = recordings.find(r => r.gender === 'female');
    const maleRec = recordings.find(r => r.gender === 'male');
    if (!femaleRec || !maleRec) {
      console.log(`[Analysis] Missing gender: female=${!!femaleRec}, male=${!!maleRec}`);
      throw new BadRequestException('Need both female and male recordings');
    }

    // Update status
    await this.sessionsService.updateStatus(sessionId, 'analyzing');

    try {
      // Process each recording
      for (const recording of recordings) {
        await this.processRecording(recording);
      }

      // Reload recordings with metrics
      const [femaleRec, maleRec] = await this.recordingsService.findBySession(sessionId);
      const female = femaleRec.gender === 'female' ? femaleRec : maleRec;
      const male = femaleRec.gender === 'male' ? femaleRec : maleRec;

      if (!female.normalizedScores || !male.normalizedScores || !female.rawMetrics || !male.rawMetrics) {
        throw new Error('Metrics not calculated');
      }

      // Calculate compatibility
      const compatibility = this.compatibilityService.calculate(
        female.normalizedScores,
        male.normalizedScores,
      );

      // Save results to session
      await this.sessionsService.setResults(sessionId, compatibility);

      // Generate interpretation
      await this.interpretationService.generate({
        sessionId,
        femaleName: session.femaleName || 'Она',
        maleName: session.maleName || 'Он',
        femaleScores: female.normalizedScores,
        maleScores: male.normalizedScores,
        femaleRaw: female.rawMetrics,
        maleRaw: male.rawMetrics,
        ...compatibility,
      });

      // Send email with results (non-blocking)
      try {
        await this.emailService.sendResults(session.email, sessionId);
      } catch (emailError) {
        console.error('[Analysis] Email failed but analysis complete:', emailError.message);
        // Don't fail the session - analysis is done, email is optional
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      await this.sessionsService.updateStatus(sessionId, 'failed');
      throw error;
    }
  }

  private async processRecording(recording: Recording): Promise<void> {
    // Get audio buffer from storage
    const audioBuffer = await this.storageService.getAudioBuffer(recording.audioUrl);

    // Extract file extension from audioUrl
    const ext = recording.audioUrl.split('.').pop() || 'webm';
    const filename = `${recording.gender}.${ext}`;
    
    // Log file info
    const fileSizeMB = audioBuffer.length / (1024 * 1024);
    console.log(`[Analysis] Processing ${recording.gender}: ${filename}, size: ${fileSizeMB.toFixed(2)}MB`);
    
    // Check file size limit (Whisper API max 25MB)
    if (audioBuffer.length > 25 * 1024 * 1024) {
      throw new BadRequestException(
        `Файл слишком большой (${fileSizeMB.toFixed(1)}MB). Максимум 25MB. Попробуйте сжать аудио или использовать более короткую запись.`
      );
    }

    // Transcribe with Whisper
    const transcription = await this.whisperService.transcribe(
      audioBuffer,
      filename,
    );

    // Analyze lexicon with GPT
    const lexicalAnalysis = await this.gptService.analyzeLexicon(transcription.text);

    // Calculate metrics
    const rawMetrics = this.metricsService.calculateRawMetrics(
      transcription.words,
      transcription.duration,
      lexicalAnalysis,
    );

    const normalizedScores = this.metricsService.normalizeMetrics(rawMetrics);

    // Update recording
    await this.recordingsService.updateWithAnalysis(recording.id, {
      transcription: transcription.text,
      wordTimestamps: transcription.words,
      durationSeconds: transcription.duration,
      rawMetrics,
      normalizedScores,
    });
  }

  async getResults(sessionId: string): Promise<AnalysisResult> {
    const session = await this.sessionsService.findOne(sessionId);

    if (session.status !== 'complete') {
      throw new NotFoundException('Analysis not complete');
    }

    const recordings = await this.recordingsService.findBySession(sessionId);
    const interpretation = await this.interpretationService.findBySession(sessionId);

    const femaleRec = recordings.find((r) => r.gender === 'female');
    const maleRec = recordings.find((r) => r.gender === 'male');

    if (!femaleRec || !maleRec || !interpretation) {
      throw new NotFoundException('Results not found');
    }

    return {
      sessionId,
      status: 'complete',
      female: {
        name: session.femaleName || 'Она',
        rawMetrics: femaleRec.rawMetrics!,
        normalizedScores: femaleRec.normalizedScores!,
      },
      male: {
        name: session.maleName || 'Он',
        rawMetrics: maleRec.rawMetrics!,
        normalizedScores: maleRec.normalizedScores!,
      },
      compatibility: {
        comfortFm: session.comfortFm!,
        comfortMf: session.comfortMf!,
        interestFm: session.interestFm!,
        interestMf: session.interestMf!,
      },
      interpretation: {
        summary: interpretation.summary,
        herWithHim: interpretation.herWithHim,
        himWithHer: interpretation.himWithHer,
        parametersComparison: interpretation.parametersComparison,
      },
      completedAt: session.completedAt?.toISOString() || new Date().toISOString(),
    };
  }
}

