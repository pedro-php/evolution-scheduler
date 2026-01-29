import { Test, TestingModule } from "@nestjs/testing";
import { AdminsController } from "./admins.controller";
import { AdminsService } from "./admins.service";
import type { JwtPayload } from "../jwt/jwt.payload";

describe("AdminsController", () => {
  let controller: AdminsController;
  let service: jest.Mocked<AdminsService>;

  const adminPayload: JwtPayload = {
    sub: "admin-id",
    email: "admin@test.com",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminsController],
      providers: [
        {
          provide: AdminsService,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AdminsController);
    service = module.get(AdminsService);
  });

  it("should return current admin", async () => {
    service.findById.mockResolvedValue({
      id: "admin-id",
      email: "admin@test.com",
      createdAt: new Date(),
    });

    const result = await controller.me(adminPayload);

    expect(service.findById).toHaveBeenCalledWith("admin-id");
    expect(result?.email).toBe("admin@test.com");
  });

  it("should update current admin", async () => {
    service.update.mockResolvedValue({
      id: "admin-id",
      email: "new@test.com",
      createdAt: new Date(),
    });

    const result = await controller.updateMe(adminPayload, {
      email: "new@test.com",
    });

    expect(service.update).toHaveBeenCalledWith("admin-id", {
      email: "new@test.com",
    });
    expect(result?.email).toBe("new@test.com");
  });
});
