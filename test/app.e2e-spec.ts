
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.e2e" });
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, Logger } from "@nestjs/common";
import request from "supertest";
import { PrismaService } from "src/core/prisma/prisma.service";
import { ScheduledMessagesCronService } from "src/modules/scheduled-messages/scheduled-messages-cron-service";
import { AppModule } from "src/app.module";
import { EvolutionApiService } from "src/modules/evolution-api/evolution-api.service";
import { RabbitMQService } from "src/modules/rabbitmq/rabbitmq.service";
import { RabbitMQMock } from "./mocks/rabbitmq.mock";


jest.setTimeout(120_000); // 2 minutes

describe("App (e2e) - full flow", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;
  let cronService: ScheduledMessagesCronService;
  let evolutionMock: { sendMessage: jest.Mock };

  const adminCredentials = {
    email: `e2e-admin+${Date.now()}@example.test`,
    password: "p@ssw0rd!",
  };

  beforeAll(async () => {
    // Create testing module but override EvolutionApiService so cron dispatch doesn't call real upstream
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EvolutionApiService)
      .useValue({
        // other methods can be left undefined if not used; we only need sendMessage for cron dispatch
        sendMessage: jest.fn().mockResolvedValue({ externalId: "e2e-ext-123" }),
      })
      .overrideProvider(RabbitMQService)
      .useValue(RabbitMQMock)
      .compile();

    app = moduleFixture.createNestApplication();
    // optionally apply same global pipes/filters/guards you use in main.ts if needed
    await app.init();

    server = app.getHttpServer();
    prisma = moduleFixture.get(PrismaService);
    cronService = moduleFixture.get(ScheduledMessagesCronService);
    evolutionMock = moduleFixture.get(EvolutionApiService) as any;
  });

  afterAll(async () => {
    try {
      if (prisma) {
        // ... your existing cleanup code ...
        await prisma.scheduledMessage.deleteMany();
        await prisma.message.deleteMany();
        await prisma.instance.deleteMany();
        await prisma.user.deleteMany();
        await prisma.admin.deleteMany();
      }
    } catch (err) {
      console.warn("Cleanup warning:", err?.message ?? err);
    }

    // Close the Nest application first (stops HTTP server, etc.)
    await app.close();

    // ADD THIS: Explicitly disconnect Prisma to kill the DB connection pool
    await prisma.$disconnect();
  });
  
  it("registers an admin, creates instance and scheduled message, dispatches it, and marks it SENT", async () => {
    const logger = new Logger("e2e-test");
    // 1) Register admin
    const registerRes = await request(server)
      .post("/auth/register")
      .send(adminCredentials)
      .expect(201);

    expect(registerRes.body).toHaveProperty("access_token");
    const token = registerRes.body.access_token as string;
    expect(typeof token).toBe("string");

    // 2) find admin id in DB
    const admin = await prisma.admin.findUnique({
      where: { email: adminCredentials.email },
    });
    expect(admin).toBeTruthy();
    const adminId = admin!.id;

    // 3) create an instance directly in DB (avoid calling evolution-api create)
    const instance = await prisma.instance.create({
      data: {
        apiKey: process.env.EVOLUTION_API_KEY ?? "e2e-key",
        name: `e2e-instance-${Date.now()}`,
        url: process.env.EVOLUTION_API_URL ?? "http://evolution-api:8080",
        admin: { connect: { id: adminId } },
      },
    });

    expect(instance).toBeTruthy();

    // 4) create a scheduled message via HTTP
    const scheduledFor = new Date(Date.now() + 1000 * 1).toISOString(); // 1 second in future
    const createDto = {
      instanceId: instance.id,
      to: "5511999999999",
      text: "E2E test message",
      scheduledFor,
    };

    const createRes = await request(server)
      .post("/scheduled-messages")
      .set("Authorization", `Bearer ${token}`)
      .send(createDto)
      .expect(201);

    expect(createRes.body).toHaveProperty("id");
    const scheduledId = createRes.body.id as string;

    // sanity check record in DB
    const dbMsg = await prisma.scheduledMessage.findUnique({
      where: { id: scheduledId },
    });
    expect(dbMsg).toBeTruthy();
    expect(dbMsg!.status).toBe("PENDING");

    // Wait until scheduled time (a little buffer)
    logger.log("Waiting for scheduled time...");
    await new Promise((r) => setTimeout(r, 1200));

    // 5) Trigger cron dispatch directly (makes the call synchronous inside the app)
    // evolution.sendMessage is mocked to return { externalId: 'e2e-ext-123' }
    await cronService.dispatchDueMessages();

    // 6) Assert Prisma record updated (SENT)
    const updated = await prisma.scheduledMessage.findUnique({
      where: { id: scheduledId },
    });
    expect(updated).toBeTruthy();
    expect(updated!.status).toBe("SENT");
    expect(updated!.externalId).toBe("e2e-ext-123");

    // Also verify that our mocked evolution sendMessage was called with expected args
    expect(evolutionMock.sendMessage).toHaveBeenCalled();
    const calledWith = evolutionMock.sendMessage.mock.calls[0][0];
    expect(calledWith.instance).toBe(instance.name);
    expect(calledWith.number).toBe(createDto.to);
    expect(calledWith.text).toBe(createDto.text);
  });
});
