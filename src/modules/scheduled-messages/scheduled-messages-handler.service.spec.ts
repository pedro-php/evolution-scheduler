jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));

import { Test } from "@nestjs/testing";
import { PrismaService } from "src/core/prisma/prisma.service";
import { ScheduleParserService } from "../openai/schedule-parser.service";
import { InstancesService } from "../instances/instances.service";
import { UsersService } from "../users/users.service";
import { ScheduleMessagesHandlerService } from "./scheduled-messages-handler.service";

describe("ScheduleMessagesHandlerService", () => {
  let service: ScheduleMessagesHandlerService;
  let prisma: any;
  let parser: any;
  let instances: any;
  let users: any;

  beforeEach(async () => {
    prisma = {
      scheduledMessage: { create: jest.fn() },
    };

    parser = { parseSchedule: jest.fn() };
    instances = { findByName: jest.fn() };
    users = { findByPhone: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        ScheduleMessagesHandlerService,
        { provide: PrismaService, useValue: prisma },
        { provide: ScheduleParserService, useValue: parser },
        { provide: InstancesService, useValue: instances },
        { provide: UsersService, useValue: users },
      ],
    }).compile();

    service = module.get(ScheduleMessagesHandlerService);
  });

  it("creates a scheduled message when intent is valid", async () => {
    instances.findByName.mockResolvedValue({ id: "inst-1" });
    users.findByPhone.mockResolvedValue({ id: "user-1" });

    parser.parseSchedule.mockResolvedValue({
      intent: "schedule_message",
      message: "hi",
      scheduledFor: new Date().toISOString(),
    });

    await service.handle({
      instance: "instance-1",
      data: {
        key: { remoteJid: "551199999999@s.whatsapp.net" },
        message: { conversation: "schedule this" },
      },
    } as any);

    expect(prisma.scheduledMessage.create).toHaveBeenCalled();
  });
});
