import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecordingsService } from './recordings.service';
import { UploadRecordingDto } from './dto/upload-recording.dto';

@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'audio/mpeg',
          'audio/mp3',
          'audio/mp4',
          'audio/m4a',
          'audio/wav',
          'audio/webm',
          'audio/ogg',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid audio format'), false);
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadRecordingDto,
  ) {
    if (!file) {
      throw new BadRequestException('No audio file provided');
    }

    const recording = await this.recordingsService.create(dto, file);
    return {
      id: recording.id,
      sessionId: recording.sessionId,
      gender: recording.gender,
      audioUrl: recording.audioUrl,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.recordingsService.findOne(id);
  }

  @Get('session/:sessionId')
  async findBySession(@Param('sessionId') sessionId: string) {
    return this.recordingsService.findBySession(sessionId);
  }
}

