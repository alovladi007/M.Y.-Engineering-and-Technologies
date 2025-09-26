import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue('pdf') private pdfQueue: Queue,
    @InjectQueue('ingestion') private ingestionQueue: Queue,
  ) {}

  async enqueuePdfGeneration(data: any) {
    return this.pdfQueue.add('generate', data);
  }

  async enqueueIngestion(data: any) {
    return this.ingestionQueue.add('ingest', data);
  }
}