import { Test } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { RedisService } from "../redis/redis.service";
import { ConflictException } from "@nestjs/common";

describe("UsersService", () => {
  let service: UsersService;
  let repo: jest.Mocked<UsersRepository>;
  let redis: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findByPhone: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            findById: jest.fn(),
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

    service = module.get(UsersService);
    repo = module.get(UsersRepository);
    redis = module.get(RedisService);
  });

  it("should throw if phone already exists", async () => {
    repo.findByPhone.mockResolvedValue({} as any);

    await expect(
      service.create("admin-id", { phone: "123", name: "John" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("should return cached user if found in redis", async () => {
    redis.get.mockResolvedValue({
      id: "1",
      phone: "123",
      name: "John",
      createdAt: new Date(),
    });

    const result = await service.findByPhone("123");

    expect(repo.findByPhone).not.toHaveBeenCalled();
    expect(result?.phone).toBe("123");
  });

  it("should fetch from db and cache if redis miss", async () => {
    redis.get.mockResolvedValue(null);
    repo.findByPhone.mockResolvedValue({
      id: "1",
      phone: "123",
      name: "John",
      createdAt: new Date(),
    } as any);

    const result = await service.findByPhone("123");

    expect(redis.set).toHaveBeenCalled();
    expect(result?.phone).toBe("123");
  });

  it("delete should call softDelete", async () => {
    repo.softDelete.mockResolvedValue({} as any);

    await service.delete("id-1");

    expect(repo.softDelete).toHaveBeenCalledWith("id-1");
  });
});
