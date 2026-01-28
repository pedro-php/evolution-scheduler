import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { CreateInstanceDto } from "./dto/create-instance.dto";
import { SendTextDto } from "./dto/send-text.dto";

@Injectable()
export class EvolutionHttpAdapter {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.EVOLUTION_API_URL,
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.EVOLUTION_API_KEY,
      },
      timeout: 10_000,
    });
  }


  createInstance(payload: CreateInstanceDto) {
    return this.client.post("/instance/create", payload);
  }

  fetchInstances() {
    return this.client.get("/instance/fetchInstances");
  }

  getStatus(instance: string) {
    return this.client.get(`/instance/connectionState/${instance}`);
  }

  connect(instance: string) {
    return this.client.get(`/instance/connect/${instance}`);
  }

  logout(instance: string) {
    return this.client.delete(`/instance/logout/${instance}`);
  }

  delete(instance: string) {
    return this.client.delete(`/instance/delete/${instance}`);
  }

  sendTextMessage(sendTextDto: SendTextDto) {
    return this.client.post(`/message/sendText/${sendTextDto.instance}`, sendTextDto);
  }
}
