import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MatterType {
  PROVISIONAL = 'PROVISIONAL',
  NONPROVISIONAL = 'NONPROVISIONAL',
  DESIGN = 'DESIGN',
  PCT = 'PCT',
}

export class CreateMatterDto {
  @ApiProperty({ example: 'Smart Patent Filing System' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ enum: MatterType, example: MatterType.NONPROVISIONAL })
  @IsEnum(MatterType)
  type: MatterType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  abstract?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string;
}