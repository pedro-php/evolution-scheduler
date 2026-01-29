import { Test, TestingModule } from "@nestjs/testing";
import { ScheduledMessagesController } from "./scheduled-messages.controller";
import { ScheduledMessagesService } from "./scheduled-messages.service";
import { JwtPayload } from "../jwt/jwt.payload";

describe("ScheduledMessagesController", () => {
  let controller: ScheduledMessagesController;
  let service: jest.Mocked<ScheduledMessagesService>;

  const admin: JwtPayload = {
    sub: "admin-1",
    email: "admin@test.com",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduledMessagesController],
      providers: [
        {
          provide: ScheduledMessagesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            cancel: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ScheduledMessagesController);
    service = module.get(ScheduledMessagesService);
  });

  it("creates a scheduled message", async () => {
    const dto = {
      instanceId: "inst-1",
      to: "551199999999",
      text: "hello",
      scheduledFor: new Date().toISOString(),
    };

    service.create.mockResolvedValue({ id: "msg-1" } as any);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: "msg-1" });
  });

  it("lists scheduled messages for admin", async () => {
    service.findAll.mockResolvedValue([{ id: "msg-1" }] as any);

    const result = await controller.findAll(admin);

    expect(service.findAll).toHaveBeenCalledWith(admin.sub);
    expect(result).toEqual([{ id: "msg-1" }]);
  });

  it("gets a scheduled message by id", async () => {
    service.findOne.mockResolvedValue({ id: "msg-1" } as any);

    const result = await controller.findOne(admin, "msg-1");

    expect(service.findOne).toHaveBeenCalledWith(admin.sub, "msg-1");
    expect(result).toEqual({ id: "msg-1" });
  });

  it("updates a scheduled message", async () => {
    const dto = { text: "updated text" };

    service.update.mockResolvedValue({ id: "msg-1" } as any);

    const result = await controller.update(admin, "msg-1", dto);

    expect(service.update).toHaveBeenCalledWith(admin.sub, "msg-1", dto);
    expect(result).toEqual({ id: "msg-1" });
  });

  it("cancels a scheduled message", async () => {
    service.cancel.mockResolvedValue({ count: 1 });

    await controller.cancel("msg-1");

    expect(service.cancel).toHaveBeenCalledWith("msg-1");
  });
});
