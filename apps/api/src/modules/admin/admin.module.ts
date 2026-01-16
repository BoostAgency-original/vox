import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { Session } from '../../database/entities/session.entity';
import { Recording } from '../../database/entities/recording.entity';
import { Interpretation } from '../../database/entities/interpretation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, Recording, Interpretation]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'dev-secret',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
  exports: [AdminGuard],
})
export class AdminModule {}

