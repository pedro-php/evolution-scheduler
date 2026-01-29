import { Global, Module } from '@nestjs/common';
import { MessageUpsertConsumer } from './message-upsert';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { ScheduledMessagesModule } from '../scheduled-messages/scheduled-messages.module';

@Global()
@Module({
  providers: [MessageUpsertConsumer],
  exports: [MessageUpsertConsumer],
  imports: [RabbitMQModule, ScheduledMessagesModule]
})
export class ConsumersModule {
    
}
