import { Test, TestingModule } from "@nestjs/testing";
import { InstancesRepository } from "./instances.repository";
import { PrismaService } from "src/core/prisma/prisma.service";

describe("InstancesRepository", () => {
  let repository: InstancesRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstancesRepository,
        {
          provide: PrismaService,
          useValue: {
            instance: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get(InstancesRepository);
    prisma = module.get(PrismaService);
  });

  it("should find by id", async () => {
    const findUniqueMock =
      prisma.instance.findUnique as jest.MockedFunction<
        typeof prisma.instance.findUnique
      >;

    findUniqueMock.mockResolvedValue({ id: "1" } as any);

    const result = await repository.findById("1");

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(result?.id).toBe("1");
  });

  it("should find by admin", async () => {
    const findManyMock =
      prisma.instance.findMany as jest.MockedFunction<
        typeof prisma.instance.findMany
      >;

    findManyMock.mockResolvedValue([{ id: "1" }] as any);

    const result = await repository.findByAdmin("admin-1");

    expect(findManyMock).toHaveBeenCalledWith({
      where: { adminId: "admin-1" },
    });
    expect(result).toHaveLength(1);
  });

  it("should soft delete instance", async () => {
    const updateMock =
      prisma.instance.update as jest.MockedFunction<
        typeof prisma.instance.update
      >;

    updateMock.mockResolvedValue({ id: "1", del: true } as any);

    const result = await repository.softDelete("1");

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { del: true },
    });
    expect(result.del).toBe(true);
  });
});
