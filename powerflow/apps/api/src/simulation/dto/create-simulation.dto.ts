import { IsString, IsNumber, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSimulationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsObject()
  parameters: {
    inputVoltage?: number;
    outputVoltage?: number;
    switchingFrequency?: number;
    controlMethod?: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  config?: any;
}