import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recording, Gender } from '../../database/entities/recording.entity';
import { StorageService } from '../storage/storage.service';
import { SessionsService } from '../sessions/sessions.service';
import { UploadRecordingDto } from './dto/upload-recording.dto';
import type { RawMetrics, NormalizedScores, WordTimestamp } from '@vox/shared';

@Injectable()
export class RecordingsService {
  constructor(
    @InjectRepository(Recording)
    private readonly recordingRepository: Repository<Recording>,
    private readonly storageService: StorageService,
    private readonly sessionsService: SessionsService,
  ) {}

  async create(dto: UploadRecordingDto, file: Express.Multer.File): Promise<Recording> {
    // Verify session exists
    await this.sessionsService.findOne(dto.sessionId);

    // Delete existing recording of same gender (if re-recording)
    const existing = await this.recordingRepository.findOne({
      where: { sessionId: dto.sessionId, gender: dto.gender as Gender },
    });
    if (existing) {
      console.log(`[Recording] Deleting existing ${dto.gender} recording for session ${dto.sessionId}`);
      await this.recordingRepository.delete(existing.id);
    }

    // Upload to storage
    const audioUrl = await this.storageService.uploadAudio(
      file.buffer,
      file.originalname,
      dto.sessionId,
      dto.gender,
    );

    // Create recording
    const recording = this.recordingRepository.create({
      sessionId: dto.sessionId,
      gender: dto.gender as Gender,
      audioUrl,
    });

    const saved = await this.recordingRepository.save(recording);

    // Update session status if both recordings exist
    const recordings = await this.findBySession(dto.sessionId);
    const hasFemale = recordings.some(r => r.gender === 'female');
    const hasMale = recordings.some(r => r.gender === 'male');
    if (hasFemale && hasMale) {
      await this.sessionsService.updateStatus(dto.sessionId, 'uploading');
    }

    return saved;
  }

  async findOne(id: string): Promise<Recording> {
    const recording = await this.recordingRepository.findOne({ where: { id } });

    if (!recording) {
      throw new NotFoundException(`Recording ${id} not found`);
    }

    return recording;
  }

  async findBySession(sessionId: string): Promise<Recording[]> {
    return this.recordingRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async updateWithAnalysis(
    id: string,
    data: {
      transcription: string;
      wordTimestamps: WordTimestamp[];
      durationSeconds: number;
      rawMetrics: RawMetrics;
      normalizedScores: NormalizedScores;
    },
  ): Promise<Recording> {
    await this.recordingRepository.update(id, data);
    return this.findOne(id);
  }
}

