import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from './session.entity';
import type { ParameterComparison } from '@vox/shared';

@Entity('interpretations')
export class Interpretation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @OneToOne(() => Session, (session) => session.interpretation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ type: 'text' })
  summary: string;

  @Column({ name: 'her_with_him', type: 'text' })
  herWithHim: string;

  @Column({ name: 'him_with_her', type: 'text' })
  himWithHer: string;

  @Column({ name: 'parameters_comparison', type: 'jsonb' })
  parametersComparison: ParameterComparison[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

