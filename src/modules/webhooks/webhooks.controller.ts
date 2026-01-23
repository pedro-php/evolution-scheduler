import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import type { EvolutionMessageUpsertPayload } from "./interfaces/evolution.webhook.interface";
import { WebhooksService } from "./webhooks.service";

@Controller("webhooks/evolution")
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Post("messages-upsert")
  @HttpCode(200)
  async onMessageUpsert(@Body() payload: EvolutionMessageUpsertPayload) {
    await this.service.handleMessageUpsert(payload);
  }

  @Post("send-message")
  @HttpCode(200)
  async onSendMessage(@Body() payload: EvolutionMessageUpsertPayload) {
    await this.service.handleSendMessage(payload);
  }
}
