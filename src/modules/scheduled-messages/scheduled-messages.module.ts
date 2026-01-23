import { Module } from '@nestjs/common';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { ScheduledMessagesController } from './scheduled-messages.controller';
import { ScheduledMessagesCronService } from './scheduled-messages-cron-service';
import { EvolutionApiModule } from '../evolution-api/evolution-api.module';

@Module({
  controllers: [ScheduledMessagesController],
  providers: [ScheduledMessagesService, ScheduledMessagesCronService],
  imports: [EvolutionApiModule]
})
export class ScheduledMessagesModule {}
