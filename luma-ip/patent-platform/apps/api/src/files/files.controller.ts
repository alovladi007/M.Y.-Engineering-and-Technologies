import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService } from './files.service';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('presigned-upload')
  @ApiOperation({ summary: 'Get presigned URL for file upload' })
  async getPresignedUploadUrl(@Body() body: { filename: string; contentType: string }) {
    const key = `uploads/${Date.now()}-${body.filename}`;
    const url = await this.filesService.getPresignedUploadUrl(key, body.contentType);
    return { url, key };
  }

  @Get(':key/download')
  @ApiOperation({ summary: 'Get presigned URL for file download' })
  async getPresignedDownloadUrl(@Param('key') key: string) {
    const url = await this.filesService.getPresignedDownloadUrl(key);
    return { url };
  }
}