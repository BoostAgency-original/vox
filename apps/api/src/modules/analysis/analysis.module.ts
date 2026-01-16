import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { MetricsService } from './metrics.service';
import { CompatibilityService } from './compatibility.service';
import { InterpretationService } from './interpretation.service';
import { Session } from '../../database/entities/session.entity';
import { Recording } from '../../database/entities/recording.entity';
import { Interpretation } from '../../database/entities/interpretation.entity';
import { OpenaiModule } from '../openai/openai.module';
import { StorageModule } from '../storage/storage.module';
import { SessionsModule } from '../sessions/sessions.module';
import { RecordingsModule } from '../recordings/recordings.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, Recording, Interpretation]),
    OpenaiModule,
    StorageModule,
    SessionsModule,
    RecordingsModule,
    EmailModule,
  ],
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    MetricsService,
    CompatibilityService,
    InterpretationService,
  ],
  exports: [AnalysisService],
})
export class AnalysisModule {}

