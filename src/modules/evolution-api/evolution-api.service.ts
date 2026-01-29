import { Injectable } from "@nestjs/common";
import { EvolutionHttpAdapter } from "./evolution-api-adapter";
import { PrismaService } from "src/core/prisma/prisma.service";
import { v4 as uuidv4 } from "uuid";
import { CreateInstanceDto } from "./dto/create-instance.dto";
import { SendTextDto } from "./dto/send-text.dto";
import { ConnectResponseDto } from "./dto/connect-response.dto";
import { EvolutionInstance } from "../webhooks/interfaces/evolution.instance.interface";

@Injectable()
export class EvolutionApiService {
  constructor(
    private readonly evolution: EvolutionHttpAdapter,
    private readonly prisma: PrismaService,
  ) {}

  async createInstance(dto: CreateInstanceDto) {

    const payload = {
      instanceName: dto.instanceName ?? uuidv4(),
      qrcode: dto.qrcode ?? true,
      integration: dto.integration ?? "WHATSAPP-BAILEYS",
      webhook: dto.webhook ?? {
        base64: true,
        headers: {
          "Content-Type": "application/json",
          autorization: "Bearer TOKEN"
        },
        byEvents: true,
        url: process.env.EVOLUTION_WEBHOOK_URL,
        events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"],
      },
    };

    const { data } = await this.evolution.createInstance(payload);
    return {data, instanceName: payload.instanceName};
  }

  async getStatus(instanceName: string) {
    const { data } = await this.evolution.getStatus(instanceName);
    return data;
  }

  async connect(instanceName: string) {
    const { data } = await this.evolution.connect(instanceName);
    return data as ConnectResponseDto;
  }

  async logout(instanceName: string) {
    const { data } = await this.evolution.logout(instanceName);
    return data;
  }

  async delete(instanceName: string) {  
    const { data } = await this.evolution.delete(instanceName);
    return data;
  }

  async sendMessage(sendTextDto: SendTextDto) {
    const message = await this.prisma.message.create({
      data: {
        to: sendTextDto.number,
        text: sendTextDto.text,
        status: "PENDING",
        instance: sendTextDto.instance,
      },
    });

    await this.evolution.sendTextMessage(sendTextDto);

    return message;
  }

  async fetchInstances() {
    const { data } = await this.evolution.fetchInstances();
    return data as EvolutionInstance[];
  }
}
