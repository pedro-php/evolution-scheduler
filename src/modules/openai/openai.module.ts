import { Module } from '@nestjs/common';
import { ScheduleParserService } from './schedule-parser.service';

@Module({
  providers: [ScheduleParserService],
  exports: [ScheduleParserService],
})
export class OpenaiModule {}
