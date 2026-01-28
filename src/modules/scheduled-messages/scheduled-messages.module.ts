import { Module } from '@nestjs/common';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { ScheduledMessagesController } from './scheduled-messages.controller';
import { ScheduledMessagesCronService } from './scheduled-messages-cron-service';
import { EvolutionApiModule } from '../evolution-api/evolution-api.module';
import { InstancesModule } from '../instances/instances.module';

@Module({
  controllers: [ScheduledMessagesController],
  providers: [ScheduledMessagesService, ScheduledMessagesCronService],
  imports: [EvolutionApiModule, InstancesModule]
})
export class ScheduledMessagesModule {}
