import { Module } from '@nestjs/common';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { ScheduledMessagesController } from './scheduled-messages.controller';
import { ScheduledMessagesCronService } from './scheduled-messages-cron-service';
import { EvolutionApiModule } from '../evolution-api/evolution-api.module';
import { InstancesModule } from '../instances/instances.module';
import { ScheduleMessagesHandlerService } from './scheduled-messages-handler.service';
import { UsersModule } from '../users/users.module';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  controllers: [ScheduledMessagesController],
  providers: [ScheduledMessagesService, ScheduledMessagesCronService, ScheduleMessagesHandlerService],
  imports: [EvolutionApiModule, InstancesModule, UsersModule, OpenaiModule],
  exports: [ScheduledMessagesService, ScheduleMessagesHandlerService, ScheduledMessagesCronService],
})
export class ScheduledMessagesModule {}
