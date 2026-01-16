import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Session } from '../../database/entities/session.entity';
import { Recording } from '../../database/entities/recording.entity';
import { Interpretation } from '../../database/entities/interpretation.entity';
import type { AdminStats, AdminSessionDetail, PaginatedSessions } from '@vox/shared';

@Injectable()
export class AdminService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Recording)
    private readonly recordingRepository: Repository<Recording>,
    @InjectRepository(Interpretation)
    private readonly interpretationRepository: Repository<Interpretation>,
  ) {}

  async login(password: string): Promise<{ token: string; expiresAt: string }> {
    const adminPassword = this.configService.get('ADMIN_PASSWORD');

    if (!adminPassword || password !== adminPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const token = await this.jwtService.signAsync({ role: 'admin' });

    return {
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async getStats(): Promise<AdminStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const [
      totalSessions,
      completedSessions,
      analyzingSessions,
      failedSessions,
      todaySessions,
      weekSessions,
    ] = await Promise.all([
      this.sessionRepository.count(),
      this.sessionRepository.count({ where: { status: 'complete' } }),
      this.sessionRepository.count({ where: { status: 'analyzing' } }),
      this.sessionRepository.count({ where: { status: 'failed' } }),
      this.sessionRepository.count({
        where: { createdAt: MoreThanOrEqual(todayStart) },
      }),
      this.sessionRepository.count({
        where: { createdAt: MoreThanOrEqual(weekStart) },
      }),
    ]);

    return {
      totalSessions,
      completedSessions,
      analyzingSessions,
      failedSessions,
      todaySessions,
      weekSessions,
    };
  }

  async getSessions(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedSessions> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;

    const query = this.sessionRepository.createQueryBuilder('session');

    if (options.search) {
      query.where(
        'session.email ILIKE :search OR session.femaleName ILIKE :search OR session.maleName ILIKE :search',
        { search: `%${options.search}%` },
      );
    }

    if (options.status) {
      query.andWhere('session.status = :status', { status: options.status });
    }

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = (options.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    query.orderBy(`session.${sortBy}`, sortOrder);

    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data: data.map((s) => ({
        id: s.id,
        email: s.email,
        femaleName: s.femaleName,
        maleName: s.maleName,
        status: s.status,
        comfortFm: s.comfortFm,
        comfortMf: s.comfortMf,
        interestFm: s.interestFm,
        interestMf: s.interestMf,
        createdAt: s.createdAt.toISOString(),
        completedAt: s.completedAt?.toISOString() || null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSessionDetail(id: string): Promise<AdminSessionDetail> {
    const session = await this.sessionRepository.findOne({ where: { id } });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const recordings = await this.recordingRepository.find({
      where: { sessionId: id },
    });

    const interpretation = await this.interpretationRepository.findOne({
      where: { sessionId: id },
    });

    const femaleRec = recordings.find((r) => r.gender === 'female');
    const maleRec = recordings.find((r) => r.gender === 'male');

    return {
      id: session.id,
      email: session.email,
      femaleName: session.femaleName,
      maleName: session.maleName,
      status: session.status,
      comfortFm: session.comfortFm,
      comfortMf: session.comfortMf,
      interestFm: session.interestFm,
      interestMf: session.interestMf,
      createdAt: session.createdAt.toISOString(),
      completedAt: session.completedAt?.toISOString() || null,
      femaleMetrics: femaleRec
        ? {
            raw: femaleRec.rawMetrics,
            normalized: femaleRec.normalizedScores,
            transcription: femaleRec.transcription,
          }
        : null,
      maleMetrics: maleRec
        ? {
            raw: maleRec.rawMetrics,
            normalized: maleRec.normalizedScores,
            transcription: maleRec.transcription,
          }
        : null,
      interpretation: interpretation
        ? {
            summary: interpretation.summary,
            herWithHim: interpretation.herWithHim,
            himWithHer: interpretation.himWithHer,
          }
        : null,
    };
  }

  async exportToCsv(type: 'contacts' | 'full'): Promise<string> {
    const sessions = await this.sessionRepository.find({
      order: { createdAt: 'DESC' },
    });

    if (type === 'contacts') {
      const headers = ['email', 'female_name', 'male_name', 'created_at', 'status'];
      const rows = sessions.map((s) => [
        s.email,
        s.femaleName || '',
        s.maleName || '',
        s.createdAt.toISOString(),
        s.status,
      ]);

      return [headers.join(','), ...rows.map((r) => r.map(this.escapeCsv).join(','))].join('\n');
    }

    // Full export with metrics
    const headers = [
      'email',
      'female_name',
      'male_name',
      'created_at',
      'status',
      'comfort_fm',
      'comfort_mf',
      'interest_fm',
      'interest_mf',
    ];

    const rows = sessions.map((s) => [
      s.email,
      s.femaleName || '',
      s.maleName || '',
      s.createdAt.toISOString(),
      s.status,
      s.comfortFm?.toString() || '',
      s.comfortMf?.toString() || '',
      s.interestFm?.toString() || '',
      s.interestMf?.toString() || '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.map(this.escapeCsv).join(','))].join('\n');
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

