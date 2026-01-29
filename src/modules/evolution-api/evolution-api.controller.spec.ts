jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));

import { Test, TestingModule } from "@nestjs/testing";
import { EvolutionApiController } from "./evolution-api.controller";
import { EvolutionApiService } from "./evolution-api.service";
import { ConnectResponseDto } from "./dto/connect-response.dto";
import { $Enums } from "@prisma/client";

describe("EvolutionApiController", () => {
    let controller: EvolutionApiController;
    let service: jest.Mocked<EvolutionApiService>;

    const connectResponseMock: ConnectResponseDto = {
        pairingCode: null,
        code: "CONNECTED",
        base64: "c29tZS1iYXNlNjQ=",
        count: null,
    };

    const messageMock = {
        id: "msg-1",
        instance: "i",
        to: "123",
        text: "hi",
        externalId: null,
        remoteJid: null,
        status: $Enums.MessageStatus.SENT,
        errorCode: null,
        errorReason: null,
        sentAt: new Date(),
        deliveredAt: null,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };



    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EvolutionApiController],
            providers: [
                {
                    provide: EvolutionApiService,
                    useValue: {
                        getStatus: jest.fn(),
                        connect: jest.fn(),
                        logout: jest.fn(),
                        sendMessage: jest.fn(),
                        fetchInstances: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get(EvolutionApiController);
        service = module.get(EvolutionApiService);
    });

    it("should return instance status", async () => {
        service.getStatus.mockResolvedValue("ok");

        const result = await controller.status("inst");

        expect(service.getStatus).toHaveBeenCalledWith("inst");
        expect(result).toBe("ok");
    });

    it("should connect instance", async () => {
        service.connect.mockResolvedValue(connectResponseMock);

        await controller.connect("inst");

        expect(service.connect).toHaveBeenCalledWith("inst");
    });

    it("should logout instance", async () => {
        service.logout.mockResolvedValue({});

        await controller.logout("inst");

        expect(service.logout).toHaveBeenCalledWith("inst");
    });

    it("should send text message", async () => {
        service.sendMessage.mockResolvedValue(messageMock);

        await controller.sendText({
            instance: "i",
            number: "123",
            text: "hi",
        } as any);

        expect(service.sendMessage).toHaveBeenCalled();
    });

    it("should fetch instances", async () => {
        service.fetchInstances.mockResolvedValue([]);

        const result = await controller.fetchInstances();

        expect(result).toEqual([]);
    });
});
