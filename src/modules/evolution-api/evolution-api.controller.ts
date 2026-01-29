import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Res,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
} from "@nestjs/swagger";
import type { Response } from "express";

import { EvolutionApiService } from "./evolution-api.service";
import { CreateInstanceDto } from "./dto/create-instance.dto";
import { SendTextDto } from "./dto/send-text.dto";
import { JwtAuthGuard } from "../jwt/jwt-auth.guard";

@ApiTags("Evolution")
@ApiBearerAuth("jwt")
@UseGuards(JwtAuthGuard)
@Controller("evolution")
export class EvolutionApiController {
  constructor(private readonly service: EvolutionApiService) { }

  @Get("instances/:name/status")
  @ApiOperation({ summary: "Get instance connection status" })
  @ApiParam({ name: "name", example: "my-instance" })
  status(@Param("name") name: string) {
    return this.service.getStatus(name);
  }

  @Post("instances/:name/connect")
  @ApiOperation({ summary: "Connect an Evolution instance (QR code)" })
  @ApiParam({ name: "name", example: "my-instance" })
  connect(@Param("name") name: string) {
    return this.service.connect(name);
  }

  @Post("instances/:name/connect/image")
  @ApiOperation({ summary: "Connect an Evolution instance (QR code)" })
  @ApiParam({ name: "name", example: "my-instance" })
  async connectImage(@Param("name") name: string, @Res() res: Response) {
    const data = await this.service.connect(name);
    if (!data.base64) {
      return res.status(404).json({ message: 'QR Code not available' });
    }

    const base64Data = data.base64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
    });

    return res.end(imageBuffer);
  }

  @Post("instances/:name/logout")
  @ApiOperation({ summary: "Logout an Evolution instance" })
  @ApiParam({ name: "name", example: "my-instance" })
  logout(@Param("name") name: string) {
    return this.service.logout(name);
  }

  @Post("messages/text")
  @ApiOperation({ summary: "Send a WhatsApp text message" })
  sendText(@Body() dto: SendTextDto) {
    return this.service.sendMessage(dto);
  }

  @Get("instances")
  @ApiOperation({ summary: "Get all instances" })
  fetchInstances() {
    return this.service.fetchInstances();
  }
}
