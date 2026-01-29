import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import type { EvolutionMessageUpsertPayload } from "./interfaces/evolution.webhook.interface";
import { WebhooksService } from "./webhooks.service";
import type { EvolutionConnectionUpdatePayload } from "./interfaces/evolution.connection.update.interface";
import { ApiExcludeController } from "@nestjs/swagger";

@Controller("webhooks/evolution")
@ApiExcludeController()
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Post("connection-update")
  @HttpCode(200)
  async onConnectionUpdate(@Body() payload: EvolutionConnectionUpdatePayload) {
    await this.service.handleConnectionUpdate(payload);
  }

  @Post("messages-upsert")
  @HttpCode(200)
  async onMessageUpsert(@Body() payload: EvolutionMessageUpsertPayload) {
    await this.service.handleMessageUpsert(payload);
  }
}
