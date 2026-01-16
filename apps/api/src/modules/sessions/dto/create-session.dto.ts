import { IsEmail, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  femaleName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  maleName: string;
}

