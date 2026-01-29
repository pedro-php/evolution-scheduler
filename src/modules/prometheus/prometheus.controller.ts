import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { PrometheusService } from "./prometheus.service";

@Controller("metrics")
export class PrometheusController {
  constructor(private readonly prometheus: PrometheusService) {}

  @Get()
  async metrics(@Res() res: Response) {
    res.set("Content-Type", this.prometheus.getContentType());
    res.send(await this.prometheus.getMetrics());
  }
}
