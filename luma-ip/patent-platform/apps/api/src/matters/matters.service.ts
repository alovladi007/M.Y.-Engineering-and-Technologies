import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatterDto } from './dto/create-matter.dto';

@Injectable()
export class MattersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, orgId: string, data: CreateMatterDto) {
    return this.prisma.matter.create({
      data: {
        ...data,
        orgId,
        createdById: userId,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.matter.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.matter.findUnique({
      where: { id },
      include: {
        claims: true,
        agentRuns: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.matter.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.matter.delete({
      where: { id },
    });
  }
}