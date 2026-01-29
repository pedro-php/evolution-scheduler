jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));


import { Test, TestingModule } from "@nestjs/testing";
import { InstancesService } from "./instances.service";
import { InstancesRepository } from "./instances.repository";
import { EvolutionApiService } from "../evolution-api/evolution-api.service";
import { RedisService } from "../redis/redis.service";
import { NotFoundException } from "@nestjs/common";

describe("InstancesService", () => {
  let service: InstancesService;
  let repo: jest.Mocked<InstancesRepository>;
  let evolution: jest.Mocked<EvolutionApiService>;
  let redis: jest.Mocked<RedisService>;

  const instanceMock = {
    id: "inst-1",
    name: "instance-1",
    adminId: "admin-1",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstancesService,
        {
          provide: InstancesRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByName: jest.fn(),
            findByAdmin: jest.fn(),
            softDelete: jest.fn(),
            patchByName: jest.fn(),
          },
        },
        {
          provide: EvolutionApiService,
          useValue: {
            createInstance: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(InstancesService);
    repo = module.get(InstancesRepository);
    evolution = module.get(EvolutionApiService);
    redis = module.get(RedisService);
  });

  it("should create instance via evolution api", async () => {
    evolution.createInstance.mockResolvedValue({
      instanceName: "instance-1",
    } as any);

    repo.create.mockResolvedValue(instanceMock as any);

    const result = await service.create(
      { sub: "admin-1" } as any,
      {} as any,
    );

    expect(evolution.createInstance).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(result).toEqual(instanceMock);
  });

  it("should delete instance", async () => {
    repo.findById.mockResolvedValue(instanceMock as any);
    repo.softDelete.mockResolvedValue({ ...instanceMock, del: true } as any);

    await service.delete("inst-1");

    expect(evolution.delete).toHaveBeenCalledWith("instance-1");
    expect(repo.softDelete).toHaveBeenCalledWith("inst-1");
  });

  it("should throw if deleting non-existing instance", async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.delete("missing")).rejects.toThrow(NotFoundException);
  });

  it("should return cached instance by name", async () => {
    redis.get.mockResolvedValue(instanceMock as any);

    const result = await service.findByName("instance-1");

    expect(redis.get).toHaveBeenCalled();
    expect(repo.findByName).not.toHaveBeenCalled();
    expect(result).toEqual(instanceMock);
  });

  it("should fetch instance from db and cache it", async () => {
    redis.get.mockResolvedValue(null);
    repo.findByName.mockResolvedValue(instanceMock as any);

    const result = await service.findByName("instance-1");

    expect(repo.findByName).toHaveBeenCalled();
    expect(redis.set).toHaveBeenCalled();
    expect(result).toEqual(instanceMock);
  });
});
