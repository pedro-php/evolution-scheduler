jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));


import { Test, TestingModule } from "@nestjs/testing";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";

describe("WebhooksController", () => {
  let controller: WebhooksController;

  let service: {
    handleConnectionUpdate: jest.Mock;
    handleMessageUpsert: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: WebhooksService,
          useValue: {
            handleConnectionUpdate: jest.fn(),
            handleMessageUpsert: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(WebhooksController);
    service = module.get(WebhooksService);
  });

  it("should delegate connection update to service", async () => {
    const payload = { instance: "inst-1" };

    await controller.onConnectionUpdate(payload as any);

    expect(service.handleConnectionUpdate).toHaveBeenCalledWith(payload);
  });

  it("should delegate message upsert to service", async () => {
    const payload = { data: { key: {} } };

    await controller.onMessageUpsert(payload as any);

    expect(service.handleMessageUpsert).toHaveBeenCalledWith(payload);
  });
});
