import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { CreateScheduledMessageDto } from "./dto/create-scheduled-message.dto";
import { UpdateScheduledMessageDto } from "./dto/update-scheduled-message.dto";

@Injectable()
export class ScheduledMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScheduledMessageDto) {
    return this.prisma.scheduledMessage.create({
      data: {
        instanceId: dto.instanceId,
        to: dto.to,
        text: dto.text,
        scheduledFor: new Date(dto.scheduledFor),
      },
    });
  }

  async findAll(instanceId: string) {
    return this.prisma.scheduledMessage.findMany({
      where: { instanceId },
      orderBy: { scheduledFor: "asc" },
    });
  }

  async findOne(instanceId: string, id: string) {
    return this.prisma.scheduledMessage.findFirst({
      where: { id, instanceId },
    });
  }

  async update(userId: string, id: string, dto: UpdateScheduledMessageDto) {
    const message = await this.findOne(userId, id);

    if (!message) throw new NotFoundException();
    if (message.status !== "PENDING")
      throw new BadRequestException("Cannot update processed messages");

    return this.prisma.scheduledMessage.update({
      where: { id },
      data: {
        ...dto,
        scheduledFor: dto.scheduledFor
          ? new Date(dto.scheduledFor)
          : undefined,
      },
    });
  }

  async cancel( id: string) {
    return this.prisma.scheduledMessage.updateMany({
      where: {
        id,
        status: "PENDING",
      },
      data: { status: "CANCELLED" },
    });
  }
}
