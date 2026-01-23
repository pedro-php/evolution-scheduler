import { Injectable, Logger } from "@nestjs/common";
import { MessageStatus } from "@prisma/client";
import { PrismaService } from "src/core/prisma/prisma.service";
import { EvolutionMessageUpsertPayload } from "./interfaces/evolution.webhook.interface";

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(private readonly prisma: PrismaService) { }

    async handleMessageUpsert(payload: EvolutionMessageUpsertPayload) {
        const text = payload?.data?.message?.conversation;
        const fromJid = payload?.data?.key?.remoteJid;
        const instance = payload?.instance;

        if (!text || !text.startsWith("!schedule") || !payload.data.key.fromMe) return;

        const parsed = this.parseScheduleCommand(text);
        if (!parsed) return;

        const { message, scheduledFor } = parsed;

        const phone = fromJid.replace("@s.whatsapp.net", "");


        await this.prisma.scheduledMessage.create({
            data: {
                instance,
                to: phone,
                text: message,
                scheduledFor,
                status: MessageStatus.PENDING,
            },
        });

        this.logger.log(
            `Scheduled message for ${phone} at ${scheduledFor.toISOString()}`,
        );
    }

    async handleSendMessage(payload: EvolutionMessageUpsertPayload) {
        const text = payload?.data?.message?.conversation;
        const fromJid = payload?.data?.key?.remoteJid;
        const instance = payload?.instance;

        if (!text || !text.startsWith("!schedule")) return;

        const parsed = this.parseScheduleCommand(text);
        if (!parsed) return;

        const { message, scheduledFor } = parsed;

        const phone = fromJid.replace("@s.whatsapp.net", "");


        await this.prisma.scheduledMessage.create({
            data: {
                instance,
                to: phone,
                text: message,
                scheduledFor,
                status: MessageStatus.PENDING,
            },
        });

        this.logger.log(
            `Scheduled message for ${phone} at ${scheduledFor.toISOString()}`,
        );
    }

    /**
     * Parses: !schedule "Hello" "2026-01-25 14:30"
     */
    private parseScheduleCommand(
        text: string,
    ): { message: string; scheduledFor: Date } | null {
        const regex =
            /^!schedule\s+"(.+?)"\s+"(.+?)"\s*$/i;

        const match = text.match(regex);
        if (!match) return null;

        const [, message, dateRaw] = match;

        const date = new Date(dateRaw);
        if (isNaN(date.getTime())) return null;

        return { message, scheduledFor: date };
    }
}
