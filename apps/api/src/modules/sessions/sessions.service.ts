import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from '../../database/entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async create(dto: CreateSessionDto): Promise<Session> {
    const session = this.sessionRepository.create({
      email: dto.email,
      femaleName: dto.femaleName,
      maleName: dto.maleName,
      status: 'pending',
    });

    return this.sessionRepository.save(session);
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['recordings', 'interpretation'],
    });

    if (!session) {
      throw new NotFoundException(`Session ${id} not found`);
    }

    return session;
  }

  async updateStatus(id: string, status: SessionStatus): Promise<Session> {
    await this.sessionRepository.update(id, { status });
    return this.findOne(id);
  }

  async setResults(
    id: string,
    results: {
      comfortFm: number;
      comfortMf: number;
      interestFm: number;
      interestMf: number;
    },
  ): Promise<Session> {
    await this.sessionRepository.update(id, {
      ...results,
      status: 'complete',
      completedAt: new Date(),
    });
    return this.findOne(id);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ data: Session[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.sessionRepository.createQueryBuilder('session');

    if (options?.search) {
      query.where(
        'session.email ILIKE :search OR session.femaleName ILIKE :search OR session.maleName ILIKE :search',
        { search: `%${options.search}%` },
      );
    }

    if (options?.status) {
      query.andWhere('session.status = :status', { status: options.status });
    }

    query.orderBy('session.createdAt', 'DESC');
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }
}

