import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException, ConflictException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AdminsService } from "../admins/admins.service";
import { JwtService } from "../jwt/jwt.service";

describe("AuthService", () => {
  let service: AuthService;
  let admins: jest.Mocked<AdminsService>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AdminsService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            doesUserPasswordMatch: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    admins = module.get(AdminsService);
    jwt = module.get(JwtService);
  });

  describe("register", () => {
    it("should throw if email already exists", async () => {
      admins.findByEmail.mockResolvedValue({
        id: "id",
        email: "admin@test.com",
        createdAt: new Date(),
      });

      await expect(
        service.register({ email: "admin@test.com", password: "123" }),
      ).rejects.toThrow(ConflictException);
    });

    it("should create admin and return jwt", async () => {
      admins.findByEmail.mockResolvedValue(null);

      admins.create.mockResolvedValue({
        id: "id",
        email: "admin@test.com",
        createdAt: new Date(),
      });

      jwt.sign.mockReturnValue("jwt-token");

      const result = await service.register({
        email: "admin@test.com",
        password: "123",
      });

      expect(admins.create).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: "id",
        email: "admin@test.com",
      });
      expect(result.access_token).toBe("jwt-token");
    });
  });

  describe("login", () => {
    it("should throw if credentials are invalid", async () => {
      admins.doesUserPasswordMatch.mockResolvedValue({
        match: false,
      });

      await expect(
        service.login({ email: "x@test.com", password: "123" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should return jwt if credentials are valid", async () => {
      admins.doesUserPasswordMatch.mockResolvedValue({
        match: true,
        user: {
          id: "id",
          email: "admin@test.com",
          createdAt: new Date(),
        },
      });

      jwt.sign.mockReturnValue("jwt-token");

      const result = await service.login({
        email: "admin@test.com",
        password: "123",
      });

      expect(jwt.sign).toHaveBeenCalledWith({
        sub: "id",
        email: "admin@test.com",
      });
      expect(result.access_token).toBe("jwt-token");
    });
  });
});
