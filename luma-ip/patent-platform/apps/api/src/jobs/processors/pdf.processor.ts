import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('pdf')
export class PdfProcessor {
  @Process('generate')
  async handleGenerate(job: Job) {
    console.log('Processing PDF generation job:', job.data);
    // PDF generation logic here
    return { success: true };
  }
}