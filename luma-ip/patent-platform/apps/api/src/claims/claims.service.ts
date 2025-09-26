import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClaimsService {
  constructor(private prisma: PrismaService) {}

  async findByMatter(matterId: string) {
    return this.prisma.claim.findMany({
      where: { matterId },
      orderBy: { number: 'asc' },
    });
  }

  async updateClaims(matterId: string, claims: any[]) {
    // Delete existing claims
    await this.prisma.claim.deleteMany({
      where: { matterId },
    });

    // Create new claims
    return this.prisma.claim.createMany({
      data: claims.map(claim => ({
        ...claim,
        matterId,
      })),
    });
  }
}