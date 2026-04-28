import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UniversalAdapterController } from './adapter.controller';
import { UniversalAdapterService } from './adapter.service';

@Module({
  imports: [HttpModule],
  controllers: [UniversalAdapterController],
  providers: [UniversalAdapterService],
  exports: [UniversalAdapterService],
})
export class UniversalAdapterModule {}
