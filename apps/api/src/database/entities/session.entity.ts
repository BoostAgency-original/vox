import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Recording } from './recording.entity';
import { Interpretation } from './interpretation.entity';

export type SessionStatus = 'pending' | 'uploading' | 'analyzing' | 'complete' | 'failed';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'female_name', type: 'varchar', length: 100, nullable: true })
  femaleName: string | null;

  @Column({ name: 'male_name', type: 'varchar', length: 100, nullable: true })
  maleName: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: SessionStatus;

  @Column({ name: 'comfort_fm', type: 'decimal', precision: 5, scale: 2, nullable: true })
  comfortFm: number | null;

  @Column({ name: 'comfort_mf', type: 'decimal', precision: 5, scale: 2, nullable: true })
  comfortMf: number | null;

  @Column({ name: 'interest_fm', type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestFm: number | null;

  @Column({ name: 'interest_mf', type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestMf: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @OneToMany(() => Recording, (recording) => recording.session)
  recordings: Recording[];

  @OneToOne(() => Interpretation, (interpretation) => interpretation.session)
  interpretation: Interpretation | null;
}

