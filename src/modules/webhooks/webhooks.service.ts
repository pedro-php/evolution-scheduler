import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { ScheduleParserService } from "../openai/schedule-parser.service";
import { EvolutionMessageUpsertPayload } from "./interfaces/evolution.webhook.interface";
import { MessageStatus } from "@prisma/client";

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiParser: ScheduleParserService,
  ) {}

  async handleMessageUpsert(payload: EvolutionMessageUpsertPayload) {
    if (!payload?.data?.key?.fromMe) return;
    await this.trySchedule(payload);
  }

  async handleSendMessage(payload: EvolutionMessageUpsertPayload) {
    await this.trySchedule(payload);
  }

  private async trySchedule(payload: EvolutionMessageUpsertPayload) {
    const text = payload?.data?.message?.conversation;
    const fromJid = payload?.data?.key?.remoteJid;
    const instance = payload?.instance;

    if (!text || !fromJid) return;

    if(!text.toLocaleUpperCase().startsWith("!schedule")) return;

    const intent = await this.aiParser.parseSchedule(text);
    if (!intent) return;

    const scheduledFor = new Date(intent.scheduledFor);
    if (isNaN(scheduledFor.getTime())) return;

    const phone = fromJid.replace("@s.whatsapp.net", "");

    await this.prisma.scheduledMessage.create({
      data: {
        instance,
        to: phone,
        text: intent.message,
        scheduledFor,
        status: MessageStatus.PENDING,
      },
    });

    this.logger.log(
      `AI scheduled message for ${phone} at ${scheduledFor.toISOString()}`,
    );
  }
}
