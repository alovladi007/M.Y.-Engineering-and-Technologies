import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgentService } from './agent.service';

@ApiTags('agent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agent')
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Post('runs')
  @ApiOperation({ summary: 'Create a new AI agent run' })
  async createRun(@Body() body: { matter_id: string; goals: string[] }) {
    return this.agentService.createRun(body.matter_id, body.goals);
  }

  @Get('runs/:id')
  @ApiOperation({ summary: 'Get agent run status' })
  async getRunStatus(@Param('id') id: string) {
    return this.agentService.getRunStatus(id);
  }
}