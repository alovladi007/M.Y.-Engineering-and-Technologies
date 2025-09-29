import { Module } from '@nestjs/common';
import { SstController } from './sst.controller';
import { SstService } from './sst.service';

@Module({
  controllers: [SstController],
  providers: [SstService],
  exports: [SstService],
})
export class SstModule {}