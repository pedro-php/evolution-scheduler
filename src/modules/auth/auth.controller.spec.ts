import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  it("calls AuthService.register", async () => {
    authServiceMock.register.mockResolvedValue({ access_token: "token" });

    const result = await controller.register({
      email: "test@test.com",
      password: "123",
    });

    expect(result.access_token).toBe("token");
    expect(authServiceMock.register).toHaveBeenCalled();
  });

  it("calls AuthService.login", async () => {
    authServiceMock.login.mockResolvedValue({ access_token: "token" });

    const result = await controller.login({
      email: "test@test.com",
      password: "123",
    });

    expect(result.access_token).toBe("token");
    expect(authServiceMock.login).toHaveBeenCalled();
  });
});

