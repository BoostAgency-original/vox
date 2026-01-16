import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { RecordingsModule } from './modules/recordings/recordings.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { OpenaiModule } from './modules/openai/openai.module';
import { StorageModule } from './modules/storage/storage.module';
import { EmailModule } from './modules/email/email.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    SessionsModule,
    RecordingsModule,
    AnalysisModule,
    OpenaiModule,
    StorageModule,
    EmailModule,
    AdminModule,
  ],
})
export class AppModule {}

