import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { ScheduleParserService } from "../openai/schedule-parser.service";
import { InstancesService } from "../instances/instances.service";
import { UsersService } from "../users/users.service";
import { MessageStatus } from "@prisma/client";
import { EvolutionMessageUpsertPayload } from "../webhooks/interfaces/evolution.webhook.interface";

@Injectable()
export class ScheduleMessagesHandlerService {
  private readonly logger = new Logger(ScheduleMessagesHandlerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduleParserService: ScheduleParserService,
    private readonly instanceService: InstancesService,
    private readonly usersService: UsersService,
  ) {}

  async handle(payload: EvolutionMessageUpsertPayload) {
    if (payload?.data?.key?.remoteJid?.includes("@g.us")) return;
    if (payload?.data?.key?.fromMe) return;

    const text = payload?.data?.message?.conversation;
    const fromJid = payload?.data?.key?.remoteJid.includes("@lid")
      ? payload?.data?.key?.remoteJidAlt!
      : payload?.data?.key?.remoteJid;

    if (!text || !fromJid) return;

    const instance = await this.instanceService.findByName(payload.instance!);
    if (!instance) {
      this.logger.warn(`Instance not found: ${payload.instance}`);
      return;
    }

    const phone = fromJid.replace(/[:@].*$/, "");
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      this.logger.warn(`User not found: ${phone}`);
      return;
    }

    const intent = await this.scheduleParserService.parseSchedule(text);
    if (!intent) return;

    const scheduledFor = new Date(intent.scheduledFor);
    if (isNaN(scheduledFor.getTime())) return;

    await this.prisma.scheduledMessage.create({
      data: {
        instanceId: instance.id,
        to: phone,
        text: intent.message,
        scheduledFor,
        status: MessageStatus.PENDING,
      },
    });

    this.logger.log(
      `Scheduled message for ${phone} at ${scheduledFor.toISOString()}`,
    );
  }
}
