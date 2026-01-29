import { Injectable } from "@nestjs/common";
import { InstancesService } from "../instances/instances.service";
import { Prisma } from "@prisma/client";
import { EvolutionConnectionUpdatePayload } from "./interfaces/evolution.connection.update.interface";
import { EvolutionMessageUpsertPayload } from "./interfaces/evolution.webhook.interface";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { QUEUES } from "../rabbitmq/enums/queues.enum";

@Injectable()
export class WebhooksService {
  constructor(
    private readonly instanceService: InstancesService,
    private readonly rabbit: RabbitMQService,
  ) {}

  async handleConnectionUpdate(payload: EvolutionConnectionUpdatePayload) {
    if (!payload?.instance) return;

    const patch: Prisma.InstanceUpdateInput = {
      connected: payload?.data?.state === "open",
    };

    if (payload?.data?.wuid) {
      patch.phone = payload.data.wuid.replace(/[:@].*$/, "");
    }

    await this.instanceService.patchInstanceByName(payload.instance, patch);
  }

  async handleMessageUpsert(payload: EvolutionMessageUpsertPayload) {
    await this.rabbit.publish(
      QUEUES.MESSAGE_UPSERT,
      payload,
    );
  }
}
