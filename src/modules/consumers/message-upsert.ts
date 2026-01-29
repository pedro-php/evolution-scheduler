import { Injectable, OnModuleInit } from "@nestjs/common";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { QUEUES } from "../rabbitmq/enums/queues.enum";
import { ScheduleMessagesHandlerService } from "../scheduled-messages/scheduled-messages-handler.service";
import { EvolutionMessageUpsertPayload } from "../webhooks/interfaces/evolution.webhook.interface";

@Injectable()
export class MessageUpsertConsumer implements OnModuleInit {
  constructor(
    private readonly rabbit: RabbitMQService,
    private readonly scheduler: ScheduleMessagesHandlerService,
  ) {}

  async onModuleInit() {
    await this.rabbit.consume<EvolutionMessageUpsertPayload>(
      QUEUES.MESSAGE_UPSERT,
      async (payload) => {
        await this.scheduler.handle(payload);
      },
    );
  }
}
