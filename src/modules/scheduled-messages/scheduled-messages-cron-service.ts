import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "src/core/prisma/prisma.service";
import { EvolutionApiService } from "../evolution-api/evolution-api.service";
import { InstancesService } from "../instances/instances.service";

@Injectable()
export class ScheduledMessagesCronService {
  private readonly logger = new Logger(ScheduledMessagesCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly evolution: EvolutionApiService,
    private readonly instancesService: InstancesService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async dispatchDueMessages() {
    const now = new Date();

    const messages = await this.prisma.$transaction(async (tx) => {
      const dueMessages = await tx.scheduledMessage.findMany({
        where: {
          status: "PENDING",
          scheduledFor: { lte: now },
        },
        take: 20, // hard limit for safety
      });

      if (dueMessages.length === 0) return [];

      await tx.scheduledMessage.updateMany({
        where: {
          id: { in: dueMessages.map((m) => m.id) },
        },
        data: {
          status: "PROCESSING",
        },
      });

      return dueMessages;
    });

    if (!messages.length) return;

    this.logger.log(`Dispatching ${messages.length} scheduled messages`);

   

    for (const msg of messages) {
       const instance = await this.instancesService.findById(msg.instanceId!);
      try {
        const result = await this.evolution.sendMessage({
          instance: instance!.name,
          number: msg.to,
          text: msg.text,
        });

        await this.prisma.scheduledMessage.update({
          where: { id: msg.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            externalId: result?.externalId ?? null,
          },
        });
      } catch (err: any) {
        this.logger.error(
          `Failed to send scheduled message ${msg.id}`,
          err?.message,
        );

        await this.prisma.scheduledMessage.update({
          where: { id: msg.id },
          data: {
            status: "FAILED",
            error: err?.message ?? "Unknown error",
          },
        });
      }
    }
  }
}
