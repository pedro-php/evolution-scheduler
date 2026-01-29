jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));


import { Test } from "@nestjs/testing";
import { PrismaService } from "src/core/prisma/prisma.service";
import { EvolutionApiService } from "../evolution-api/evolution-api.service";
import { InstancesService } from "../instances/instances.service";
import { ScheduledMessagesCronService } from "./scheduled-messages-cron-service";

describe("ScheduledMessagesCronService", () => {
  let service: ScheduledMessagesCronService;
  let prisma: any;
  let evolution: any;
  let instances: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      scheduledMessage: {
        update: jest.fn(),
      },
    };

    evolution = {
      sendMessage: jest.fn(),
    };

    instances = {
      findById: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ScheduledMessagesCronService,
        { provide: PrismaService, useValue: prisma },
        { provide: EvolutionApiService, useValue: evolution },
        { provide: InstancesService, useValue: instances },
      ],
    }).compile();

    service = module.get(ScheduledMessagesCronService);
  });

  it("dispatches and marks messages as SENT", async () => {
    const dueMessage = {
      id: "msg-1",
      instanceId: "inst-1",
      to: "551199999999",
      text: "hello",
    };

    prisma.$transaction.mockImplementation(async (cb) =>
      cb({
        scheduledMessage: {
          findMany: jest.fn().mockResolvedValue([dueMessage]),
          updateMany: jest.fn(),
        },
      }),
    );

    instances.findById.mockResolvedValue({ name: "instance-1" });
    evolution.sendMessage.mockResolvedValue({ externalId: "ext-1" });

    await service.dispatchDueMessages();

    expect(evolution.sendMessage).toHaveBeenCalled();
    expect(prisma.scheduledMessage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "SENT" }),
      }),
    );
  });

  it("marks message as FAILED when send throws", async () => {
    const dueMessage = {
      id: "msg-1",
      instanceId: "inst-1",
      to: "551199999999",
      text: "hello",
    };

    prisma.$transaction.mockImplementation(async (cb) =>
      cb({
        scheduledMessage: {
          findMany: jest.fn().mockResolvedValue([dueMessage]),
          updateMany: jest.fn(),
        },
      }),
    );

    instances.findById.mockResolvedValue({ name: "instance-1" });
    evolution.sendMessage.mockRejectedValue(new Error("boom"));

    await service.dispatchDueMessages();

    expect(prisma.scheduledMessage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILED" }),
      }),
    );
  });
});
