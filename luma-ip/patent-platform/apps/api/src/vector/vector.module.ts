import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VectorService } from './vector.service';

@Module({
  imports: [HttpModule],
  providers: [VectorService],
  exports: [VectorService],
})
export class VectorModule {}