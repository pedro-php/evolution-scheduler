// test/auth.e2e-spec.ts
process.env.JWT_SECRET = "e2e-test-secret";

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersService } from "../src/modules/users/users.service";

describe("Auth (e2e) - mocked UsersService", () => {
  let app: INestApplication;

  const usersStore: Record<string, any> = {};

  const mockUsersService = {
    findByEmail: jest.fn(async (email: string) => {
      return Object.values(usersStore).find((u: any) => u.email === email) ?? null;
    }),
    create: jest.fn(async ({ email, password }: { email: string; password: string }) => {
      const id = `e2e-${Object.keys(usersStore).length + 1}`;
      const user = { id, email, password };
      usersStore[id] = user;
      return { id: user.id, email: user.email, createdAt: new Date() };
    }),
    doesUserPasswordMatch: jest.fn(async ({ email, password }: { email: string; password: string }) => {
      const user = Object.values(usersStore).find((u: any) => u.email === email) ?? null;
      if (!user) return { match: false, user: null };
      const match = user.password === password;
      return { match, user: match ? { id: user.id, email: user.email } : null };
    }),
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    moduleBuilder.overrideProvider(UsersService).useValue(mockUsersService);

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  const user = {
    email: "e2e@test.com",
    password: "password123",
  };

  it("POST /auth/register → should register a user", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send(user)
      .expect(HttpStatus.CREATED);

    expect(res.body).toHaveProperty("access_token");
    expect(typeof res.body.access_token).toBe("string");
  });

  it("POST /auth/login → should login and return JWT", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send(user)
      .expect(HttpStatus.OK);

    expect(res.body).toHaveProperty("access_token");
    expect(typeof res.body.access_token).toBe("string");
  });
});
