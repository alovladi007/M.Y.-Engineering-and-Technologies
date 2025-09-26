import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './jobs.service';
import { PdfProcessor } from './processors/pdf.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'pdf' },
      { name: 'ingestion' },
    ),
  ],
  providers: [JobsService, PdfProcessor],
  exports: [JobsService],
})
export class JobsModule {}