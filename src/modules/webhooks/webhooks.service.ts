import { PrismaService } from "src/core/prisma/prisma.service";
import { ScheduleParserService } from "../openai/schedule-parser.service";
import { EvolutionMessageUpsertPayload } from "./interfaces/evolution.webhook.interface";
import { Injectable, Logger } from "@nestjs/common";
import { InstancesService } from "../instances/instances.service";
import { MessageStatus } from "@prisma/client";
import { UsersService } from "../users/users.service";

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly scheduleParserService: ScheduleParserService,
        private readonly instanceService: InstancesService,
        private readonly usersService: UsersService,
    ) { }

    async handleMessageUpsert(payload: EvolutionMessageUpsertPayload) {
        if (!payload?.data?.key?.fromMe) return;
        await this.trySchedule(payload);
    }

    async handleSendMessage(payload: EvolutionMessageUpsertPayload) {
        await this.trySchedule(payload);
    }

    private async trySchedule(payload: EvolutionMessageUpsertPayload) {
        const text = payload?.data?.message?.conversation;
        if (payload?.data?.key?.remoteJid?.includes("@g.us")) return;
        const fromJid = payload?.data?.key?.remoteJid.includes("@lid") ? payload?.data?.key?.remoteJidAlt! : payload?.data?.key?.remoteJid;
        const instanceName = payload?.instance;

        if (!text || !fromJid || !text.toLocaleLowerCase().startsWith("!schedule")) return;

        console.dir({ text, fromJid, instanceName }, { depth: null });

        const instance = await this.instanceService.findByName(instanceName!);
        if (!instance) {
            this.logger.warn(
                `Instance not found for webhook scheduling: ${instanceName}`,
            );
            return;
        }

        const phone = fromJid.replace(/[:@].*$/, "");

        const user = await this.usersService.findByPhone(phone);
        if (!user) {
            this.logger.warn(
                `User not found for webhook scheduling: ${phone}`,
            );
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
            `AI scheduled message for ${phone} at ${scheduledFor.toISOString()}`,
        );
    }
}
