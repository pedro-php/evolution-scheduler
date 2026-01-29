import { Test } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { NotFoundException } from "@nestjs/common";

describe("UsersController", () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByPhone: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    service = module.get(UsersService);
  });

  it("should create a user", async () => {
    service.create.mockResolvedValue({ id: "1" } as any);

    const result = await controller.create(
      { sub: "admin-id" } as any,
      { phone: "123", name: "John" },
    );

    expect(service.create).toHaveBeenCalledWith("admin-id", {
      phone: "123",
      name: "John",
    });

    expect(result.id).toBe("1");
  });

  it("should throw NotFound when user does not exist", async () => {
    service.findByPhone.mockResolvedValue(null);

    await expect(controller.findByPhone("123"))
      .rejects
      .toBeInstanceOf(NotFoundException);
  });

  it("should delete user", async () => {
    service.delete.mockResolvedValue(undefined);

    await controller.delete("id-1");

    expect(service.delete).toHaveBeenCalledWith("id-1");
  });
});
