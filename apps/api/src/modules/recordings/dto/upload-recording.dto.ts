import { IsUUID, IsIn } from 'class-validator';

export class UploadRecordingDto {
  @IsUUID()
  sessionId: string;

  @IsIn(['female', 'male'])
  gender: 'female' | 'male';
}

