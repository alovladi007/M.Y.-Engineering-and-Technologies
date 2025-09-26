import { Controller, Post, Param, Body, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FormsService } from './forms.service';

@ApiTags('forms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matters/:matterId/forms')
export class FormsController {
  constructor(private formsService: FormsService) {}

  @Post('ads')
  @ApiOperation({ summary: 'Generate ADS form' })
  async generateADS(
    @Param('matterId') matterId: string,
    @Body() data: any,
    @Res() res: Response,
  ) {
    const pdf = await this.formsService.generateADS(matterId, data);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=ads.pdf',
    });
    res.send(pdf);
  }

  @Post('ids')
  @ApiOperation({ summary: 'Generate IDS form' })
  async generateIDS(
    @Param('matterId') matterId: string,
    @Body() data: any,
    @Res() res: Response,
  ) {
    const pdf = await this.formsService.generateIDS(matterId, data);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=ids.pdf',
    });
    res.send(pdf);
  }
}