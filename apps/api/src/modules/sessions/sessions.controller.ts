import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto) {
    const session = await this.sessionsService.create(createSessionDto);
    return {
      id: session.id,
      status: session.status,
      analyzeUrl: `/analyze/${session.id}`,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    const session = await this.sessionsService.findOne(id);
    return {
      id: session.id,
      status: session.status,
    };
  }
}

