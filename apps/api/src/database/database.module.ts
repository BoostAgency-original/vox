import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Session } from './entities/session.entity';
import { Recording } from './entities/recording.entity';
import { Interpretation } from './entities/interpretation.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [Session, Recording, Interpretation],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
    }),
  ],
})
export class DatabaseModule {}

