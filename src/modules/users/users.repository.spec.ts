import { Test, TestingModule } from "@nestjs/testing";
import { UsersRepository } from "./users.repository";
import { PrismaService } from "src/core/prisma/prisma.service";

describe("UsersRepository", () => {
  let repo: UsersRepository;

  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repo = module.get(UsersRepository);
    prisma = module.get(PrismaService);
  });

  it("findByPhone should query prisma correctly", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "1",
      phone: "123",
      name: "John",
      createdAt: new Date(),
    });

    const result = await repo.findByPhone("123");

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { phone: "123", del: false },
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        phone: "123",
        name: "John",
      }),
    );
  });

  it("softDelete should mark user as deleted", async () => {
    prisma.user.update.mockResolvedValue({
      id: "id-1",
    });

    await repo.softDelete("id-1");

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "id-1" },
      data: { del: true },
    });
  });
});
