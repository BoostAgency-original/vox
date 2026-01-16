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
        // Whisper supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm
        const allowedMimes = [
          'audio/mpeg',
          'audio/mp3',
          'audio/mp4',
          'audio/m4a',
          'audio/x-m4a',
          'audio/wav',
          'audio/x-wav',
          'audio/webm',
          'audio/ogg',
          'audio/flac',
          'audio/x-flac',
          'video/webm', // Browser may send webm as video
        ];
        console.log(`[Upload] File: ${file.originalname}, MIME: ${file.mimetype}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          console.warn(`[Upload] Rejected MIME type: ${file.mimetype}`);
          cb(new BadRequestException(`Неподдерживаемый формат аудио: ${file.mimetype}`), false);
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

