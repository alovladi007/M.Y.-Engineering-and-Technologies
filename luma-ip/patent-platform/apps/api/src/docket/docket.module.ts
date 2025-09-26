import { Module } from '@nestjs/common';
import { DocketService } from './docket.service';

@Module({
  providers: [DocketService],
  exports: [DocketService],
})
export class DocketModule {}