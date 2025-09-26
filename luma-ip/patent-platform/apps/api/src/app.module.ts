import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { MattersModule } from './matters/matters.module';
import { ClaimsModule } from './claims/claims.module';
import { PrismaModule } from './prisma/prisma.module';
import { FilesModule } from './files/files.module';
import { AgentModule } from './agent/agent.module';
import { PdfModule } from './pdf/pdf.module';
import { FormsModule } from './forms/forms.module';
import { BillingModule } from './billing/billing.module';
import { DocketModule } from './docket/docket.module';
import { VectorModule } from './vector/vector.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    MattersModule,
    ClaimsModule,
    FilesModule,
    AgentModule,
    PdfModule,
    FormsModule,
    BillingModule,
    DocketModule,
    VectorModule,
    JobsModule,
  ],
})
export class AppModule {}