jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));

import { Test, TestingModule } from "@nestjs/testing";
import { InstancesController } from "./instances.controller";
import { InstancesService } from "./instances.service";
import { JwtPayload } from "../jwt/jwt.payload";

describe("InstancesController", () => {
  let controller: InstancesController;
  let service: jest.Mocked<InstancesService>;

  const user: JwtPayload = {
    sub: "admin-1",
    email: "admin@test.com",
  };

  const instanceMock = {
    id: "inst-1",
    name: "instance-1",
    adminId: "admin-1",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstancesController],
      providers: [
        {
          provide: InstancesService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByAdmin: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(InstancesController);
    service = module.get(InstancesService);
  });

  it("should create an instance", async () => {
    service.create.mockResolvedValue(instanceMock as any);

    const result = await controller.create(user, {} as any);

    expect(service.create).toHaveBeenCalledWith(user, {});
    expect(result).toEqual(instanceMock);
  });

  it("should find instance by id", async () => {
    service.findById.mockResolvedValue(instanceMock as any);

    const result = await controller.findById("inst-1");

    expect(service.findById).toHaveBeenCalledWith("inst-1");
    expect(result).toEqual(instanceMock);
  });

  it("should list instances by admin", async () => {
    service.findByAdmin.mockResolvedValue([instanceMock] as any);

    const result = await controller.findMyInstances(user);

    expect(service.findByAdmin).toHaveBeenCalledWith("admin-1");
    expect(result).toHaveLength(1);
  });

  it("should delete instance", async () => {
    service.delete.mockResolvedValue(instanceMock as any);

    const result = await controller.delete("inst-1");

    expect(service.delete).toHaveBeenCalledWith("inst-1");
    expect(result).toEqual(instanceMock);
  });
});