import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { AdminsService } from "./admins.service";
import { PrismaService } from "src/core/prisma/prisma.service";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("AdminsService", () => {
  let service: AdminsService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsService,
        {
          provide: PrismaService,
          useValue: {
            admin: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(AdminsService);
    prisma = module.get(PrismaService);
  });

  describe("create", () => {
    it("should create admin with hashed password", async () => {
      prisma.admin.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");

      prisma.admin.create.mockResolvedValue({
        id: "id",
        email: "a@test.com",
        createdAt: new Date(),
      });

      const result = await service.create({
        email: "a@test.com",
        password: "123",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("123", 10);
      expect(result.email).toBe("a@test.com");
    });

    it("should throw if email exists", async () => {
      prisma.admin.findUnique.mockResolvedValue({ id: "exists" });

      await expect(
        service.create({ email: "a@test.com", password: "123" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("doesUserPasswordMatch", () => {
    it("should return false if admin not found", async () => {
      prisma.admin.findUnique.mockResolvedValue(null);

      const result = await service.doesUserPasswordMatch({
        email: "x@test.com",
        password: "123",
      });

      expect(result.match).toBe(false);
    });

    it("should compare password correctly", async () => {
      prisma.admin.findUnique.mockResolvedValue({
        email: "x@test.com",
        password: "hashed",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.doesUserPasswordMatch({
        email: "x@test.com",
        password: "123",
      });

      expect(result.match).toBe(true);
    });
  });

  describe("update", () => {
    it("should hash password if provided", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("new-hash");

      prisma.admin.update.mockResolvedValue({
        id: "id",
        email: "new@test.com",
        createdAt: new Date(),
      });

      const result = await service.update("id", {
        password: "123",
        email: "new@test.com",
      });

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result?.email).toBe("new@test.com");
    });
  });
});
