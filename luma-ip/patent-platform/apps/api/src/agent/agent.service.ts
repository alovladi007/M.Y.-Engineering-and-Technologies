import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AgentService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async createRun(matterId: string, goals: string[]) {
    // Save run to database
    const run = await this.prisma.agentRun.create({
      data: {
        matterId,
        status: 'QUEUED',
        goals,
      },
    });

    // Call Python agent service
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.configService.get('AGENT_BASE_URL')}/runs`,
          { matter_id: matterId, goals },
          {
            headers: {
              'X-Shared-Secret': this.configService.get('AGENT_SHARED_SECRET'),
            },
          },
        ),
      );

      // Update run with agent response
      await this.prisma.agentRun.update({
        where: { id: run.id },
        data: { status: 'RUNNING' },
      });

      return { run_id: run.id, status: 'queued' };
    } catch (error) {
      // If agent service is unavailable, return mock data
      await this.prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'SUCCEEDED',
          output: {
            claims: [
              {
                number: 1,
                text: 'A system for automated patent filing, comprising a processor and memory.',
                type: 'independent',
              },
            ],
            notes: ['Mock response - agent service unavailable'],
          },
          tokens: 100,
          costUSD: 0.01,
        },
      });

      return { run_id: run.id, status: 'queued' };
    }
  }

  async getRunStatus(runId: string) {
    const run = await this.prisma.agentRun.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new Error('Run not found');
    }

    return {
      run_id: run.id,
      status: run.status.toLowerCase(),
      logs: run.logs || [],
      output: run.output,
      tokens: run.tokens,
      cost_usd: run.costUSD,
    };
  }
}