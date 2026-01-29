jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));


import { Test, TestingModule } from "@nestjs/testing";
import { WebhooksService } from "./webhooks.service";
import { InstancesService } from "../instances/instances.service";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { QUEUES } from "../rabbitmq/enums/queues.enum";

describe("WebhooksService", () => {
  let service: WebhooksService;

  let instancesService: {
    patchInstanceByName: jest.Mock;
  };

  let rabbit: {
    publish: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: InstancesService,
          useValue: {
            patchInstanceByName: jest.fn(),
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(WebhooksService);
    instancesService = module.get(InstancesService);
    rabbit = module.get(RabbitMQService);
  });

  describe("handleConnectionUpdate", () => {
    it("should do nothing if instance is missing", async () => {
      await service.handleConnectionUpdate({} as any);

      expect(instancesService.patchInstanceByName).not.toHaveBeenCalled();
    });

    it("should patch connected=true when state is open", async () => {
      await service.handleConnectionUpdate({
        instance: "inst-1",
        data: { state: "open" },
      } as any);

      expect(instancesService.patchInstanceByName).toHaveBeenCalledWith(
        "inst-1",
        { connected: true },
      );
    });

    it("should patch phone when wuid is present", async () => {
      await service.handleConnectionUpdate({
        instance: "inst-1",
        data: {
          state: "open",
          wuid: "5511999999999@s.whatsapp.net",
        },
      } as any);

      expect(instancesService.patchInstanceByName).toHaveBeenCalledWith(
        "inst-1",
        {
          connected: true,
          phone: "5511999999999",
        },
      );
    });
  });

  describe("handleMessageUpsert", () => {
    it("should publish payload to MESSAGE_UPSERT queue", async () => {
      const payload = { foo: "bar" };

      await service.handleMessageUpsert(payload as any);

      expect(rabbit.publish).toHaveBeenCalledWith(
        QUEUES.MESSAGE_UPSERT,
        payload,
      );
    });
  });
});
