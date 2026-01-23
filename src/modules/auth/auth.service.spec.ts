import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "../jwt/jwt.service";
import { ConflictException, UnauthorizedException } from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;

  const usersServiceMock = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    doesUserPasswordMatch: jest.fn(),
  };

  const jwtServiceMock = {
    sign: jest.fn().mockReturnValue("signed-jwt-token"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it("registers a new user and returns a token", async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);
    usersServiceMock.create.mockResolvedValue({
      id: 1,
      email: "test@test.com",
    });

    const result = await service.register({
      email: "test@test.com",
      password: "123456",
    });

    expect(result.access_token).toBe("signed-jwt-token");
    expect(jwtServiceMock.sign).toHaveBeenCalled();
  });

  it("throws ConflictException if user already exists", async () => {
    usersServiceMock.findByEmail.mockResolvedValue({ id: 1 });

    await expect(
      service.register({ email: "test@test.com", password: "123" })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("throws UnauthorizedException on invalid login", async () => {
    usersServiceMock.doesUserPasswordMatch.mockResolvedValue({
      user: null,
      match: false,
    });

    await expect(
      service.login({ email: "test@test.com", password: "wrong" })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
