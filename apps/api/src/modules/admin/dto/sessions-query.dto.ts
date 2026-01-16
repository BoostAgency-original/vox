import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class SessionsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['pending', 'uploading', 'analyzing', 'complete', 'failed'])
  status?: string;

  @IsOptional()
  @IsIn(['createdAt', 'email', 'status'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}

