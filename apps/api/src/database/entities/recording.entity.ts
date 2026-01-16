import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from './session.entity';
import type { RawMetrics, NormalizedScores, WordTimestamp } from '@vox/shared';

export type Gender = 'female' | 'male';

@Entity('recordings')
export class Recording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => Session, (session) => session.recordings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ type: 'varchar', length: 10 })
  gender: Gender;

  @Column({ name: 'audio_url', type: 'varchar', length: 500 })
  audioUrl: string;

  @Column({ name: 'duration_seconds', type: 'decimal', precision: 6, scale: 2, nullable: true })
  durationSeconds: number | null;

  @Column({ type: 'text', nullable: true })
  transcription: string | null;

  @Column({ name: 'word_timestamps', type: 'jsonb', nullable: true })
  wordTimestamps: WordTimestamp[] | null;

  @Column({ name: 'raw_metrics', type: 'jsonb', nullable: true })
  rawMetrics: RawMetrics | null;

  @Column({ name: 'normalized_scores', type: 'jsonb', nullable: true })
  normalizedScores: NormalizedScores | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

