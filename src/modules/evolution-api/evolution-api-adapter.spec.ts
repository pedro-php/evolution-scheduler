import axios from "axios";
import { EvolutionHttpAdapter } from "./evolution-api-adapter";

jest.mock("axios");

describe("EvolutionHttpAdapter", () => {
  let adapter: EvolutionHttpAdapter;
  let client: any;

  beforeEach(() => {
    client = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    (axios.create as jest.Mock).mockReturnValue(client);

    process.env.EVOLUTION_API_URL = "http://evolution";
    process.env.EVOLUTION_API_KEY = "key";

    adapter = new EvolutionHttpAdapter();
  });

  it("should create instance", async () => {
    client.post.mockResolvedValue({ data: "ok" });

    await adapter.createInstance({ instanceName: "test" } as any);

    expect(client.post).toHaveBeenCalledWith(
      "/instance/create",
      expect.any(Object),
    );
  });

  it("should fetch instances", async () => {
    await adapter.fetchInstances();
    expect(client.get).toHaveBeenCalledWith("/instance/fetchInstances");
  });

  it("should get status", async () => {
    await adapter.getStatus("abc");
    expect(client.get).toHaveBeenCalledWith(
      "/instance/connectionState/abc",
    );
  });

  it("should connect instance", async () => {
    await adapter.connect("abc");
    expect(client.get).toHaveBeenCalledWith("/instance/connect/abc");
  });

  it("should logout instance", async () => {
    await adapter.logout("abc");
    expect(client.delete).toHaveBeenCalledWith("/instance/logout/abc");
  });

  it("should delete instance", async () => {
    await adapter.delete("abc");
    expect(client.delete).toHaveBeenCalledWith("/instance/delete/abc");
  });

  it("should send text message", async () => {
    await adapter.sendTextMessage({
      instance: "i",
      number: "123",
      text: "hi",
    } as any);

    expect(client.post).toHaveBeenCalledWith(
      "/message/sendText/i",
      expect.any(Object),
    );
  });
});
