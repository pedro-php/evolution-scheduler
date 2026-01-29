jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));

import { Test, TestingModule } from "@nestjs/testing";
import { EvolutionApiService } from "./evolution-api.service";
import { EvolutionHttpAdapter } from "./evolution-api-adapter";
import { PrismaService } from "src/core/prisma/prisma.service";

describe("EvolutionApiService", () => {
  let service: EvolutionApiService;
  let adapter: jest.Mocked<EvolutionHttpAdapter>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvolutionApiService,
        {
          provide: EvolutionHttpAdapter,
          useValue: {
            createInstance: jest.fn(),
            getStatus: jest.fn(),
            connect: jest.fn(),
            logout: jest.fn(),
            delete: jest.fn(),
            sendTextMessage: jest.fn(),
            fetchInstances: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            message: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(EvolutionApiService);
    adapter = module.get(EvolutionHttpAdapter);
    prisma = module.get(PrismaService);
  });

  it("should create instance with generated name", async () => {
    adapter.createInstance.mockResolvedValue({ data: {} } as any);

    const result = await service.createInstance({} as any);

    expect(adapter.createInstance).toHaveBeenCalled();
    expect(result.instanceName).toBeDefined();
  });

  it("should get status", async () => {
    adapter.getStatus.mockResolvedValue({ data: "ok" } as any);

    const result = await service.getStatus("inst");

    expect(result).toBe("ok");
  });

  it("should connect instance", async () => {
    adapter.connect.mockResolvedValue({ data: { base64: "img" } } as any);

    const result = await service.connect("inst");

    expect(result.base64).toBe("img");
  });

  it("should logout instance", async () => {
    adapter.logout.mockResolvedValue({ data: "ok" } as any);

    const result = await service.logout("inst");

    expect(result).toBe("ok");
  });

  it("should delete instance", async () => {
    adapter.delete.mockResolvedValue({ data: "ok" } as any);

    const result = await service.delete("inst");

    expect(result).toBe("ok");
  });

  it("should send message and persist it", async () => {
    const createMock = prisma.message.create as jest.Mock;
    createMock.mockResolvedValue({ id: "msg" });


    const result = await service.sendMessage({
      instance: "i",
      number: "123",
      text: "hi",
    } as any);

    expect(prisma.message.create).toHaveBeenCalled();
    expect(adapter.sendTextMessage).toHaveBeenCalled();
    expect(result.id).toBe("msg");
  });

  it("should fetch instances", async () => {
    adapter.fetchInstances.mockResolvedValue({ data: [] } as any);

    const result = await service.fetchInstances();

    expect(result).toEqual([]);
  });
});
