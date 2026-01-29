import { Test, TestingModule } from "@nestjs/testing";
import { AdminsRepository } from "./admins.repository";
import { PrismaService } from "src/core/prisma/prisma.service";

describe("AdminsRepository", () => {
  let repository: AdminsRepository;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsRepository,
        {
          provide: PrismaService,
          useValue: {
            admin: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get(AdminsRepository);
    prisma = module.get(PrismaService);
  });

  it("should find by email", async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: "1" });

    const result = await repository.findByEmail("a@test.com");

    expect(prisma.admin.findUnique).toHaveBeenCalledWith({
      where: { email: "a@test.com" },
    });
    expect(result).toEqual({ id: "1" });
  });

  it("should find by id", async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: "1" });

    const result = await repository.findById("1");

    expect(prisma.admin.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(result).toEqual({ id: "1" });
  });

  it("should create admin", async () => {
    prisma.admin.create.mockResolvedValue({ id: "1" });

    const result = await repository.create({
      email: "a@test.com",
      password: "hashed",
    });

    expect(prisma.admin.create).toHaveBeenCalledWith({
      data: { email: "a@test.com", password: "hashed" },
    });
    expect(result).toEqual({ id: "1" });
  });
});
