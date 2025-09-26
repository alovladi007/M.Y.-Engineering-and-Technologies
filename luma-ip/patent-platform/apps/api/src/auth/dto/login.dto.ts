import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'demo@patentplatform.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'demo123456' })
  @IsString()
  @MinLength(6)
  password: string;
}