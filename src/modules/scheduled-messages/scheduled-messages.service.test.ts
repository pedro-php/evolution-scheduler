import { Test } from "@nestjs/testing";
import { ScheduledMessagesService } from "./scheduled-messages.service";
import { PrismaService } from "src/core/prisma/prisma.service";
import { BadRequestException } from "@nestjs/common";

describe("ScheduledMessagesService", () => {
  let service: ScheduledMessagesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      scheduledMessage: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        ScheduledMessagesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ScheduledMessagesService);
  });

  it("creates a scheduled message", async () => {
    prisma.scheduledMessage.create.mockResolvedValue({ id: "1" });

    const result = await service.create({
      instanceId: "i",
      to: "123",
      text: "hi",
      scheduledFor: new Date().toISOString(),
    });

    expect(result).toEqual({ id: "1" });
  });

  it("throws if updating non-pending message", async () => {
    prisma.scheduledMessage.findFirst.mockResolvedValue({
      status: "SENT",
    });

    await expect(
      service.update("inst", "msg", {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
