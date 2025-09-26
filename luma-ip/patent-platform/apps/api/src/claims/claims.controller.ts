import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClaimsService } from './claims.service';

@ApiTags('claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matters/:matterId/claims')
export class ClaimsController {
  constructor(private claimsService: ClaimsService) {}

  @Get()
  @ApiOperation({ summary: 'Get claims for a matter' })
  async getClaims(@Param('matterId') matterId: string) {
    return this.claimsService.findByMatter(matterId);
  }

  @Put()
  @ApiOperation({ summary: 'Update all claims for a matter' })
  async updateClaims(
    @Param('matterId') matterId: string,
    @Body() body: { claims: any[] },
  ) {
    return this.claimsService.updateClaims(matterId, body.claims);
  }
}