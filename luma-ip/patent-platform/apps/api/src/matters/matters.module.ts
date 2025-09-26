import { Module } from '@nestjs/common';
import { MattersService } from './matters.service';
import { MattersController } from './matters.controller';

@Module({
  controllers: [MattersController],
  providers: [MattersService],
  exports: [MattersService],
})
export class MattersModule {}