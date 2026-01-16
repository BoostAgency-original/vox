import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recording } from '../../database/entities/recording.entity';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { StorageModule } from '../storage/storage.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recording]),
    StorageModule,
    SessionsModule,
  ],
  controllers: [RecordingsController],
  providers: [RecordingsService],
  exports: [RecordingsService],
})
export class RecordingsModule {}

