import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService);
  });

  it("should register admin", async () => {
    service.register.mockResolvedValue({
      access_token: "jwt-token",
    });

    const result = await controller.register({
      email: "admin@test.com",
      password: "123",
    });

    expect(service.register).toHaveBeenCalledWith({
      email: "admin@test.com",
      password: "123",
    });
    expect(result.access_token).toBe("jwt-token");
  });

  it("should login admin", async () => {
    service.login.mockResolvedValue({
      access_token: "jwt-token",
    });

    const result = await controller.login({
      email: "admin@test.com",
      password: "123",
    });

    expect(service.login).toHaveBeenCalledWith({
      email: "admin@test.com",
      password: "123",
    });
    expect(result.access_token).toBe("jwt-token");
  });
});
