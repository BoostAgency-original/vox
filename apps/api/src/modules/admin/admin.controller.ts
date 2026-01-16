import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { LoginDto } from './dto/login.dto';
import { SessionsQueryDto } from './dto/sessions-query.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.adminService.login(dto.password);

    // Set cookie
    res.cookie('admin_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return result;
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('admin_token');
    return { success: true };
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('sessions')
  @UseGuards(AdminGuard)
  async getSessions(@Query() query: SessionsQueryDto) {
    return this.adminService.getSessions(query);
  }

  @Get('sessions/:id')
  @UseGuards(AdminGuard)
  async getSessionDetail(@Param('id') id: string) {
    return this.adminService.getSessionDetail(id);
  }

  @Get('export')
  @UseGuards(AdminGuard)
  async export(
    @Query('type') type: 'contacts' | 'full',
    @Res() res: Response,
  ) {
    const csv = await this.adminService.exportToCsv(type || 'contacts');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=vox-export-${type}-${Date.now()}.csv`,
    );
    res.send('\ufeff' + csv); // BOM for Excel
  }
}

