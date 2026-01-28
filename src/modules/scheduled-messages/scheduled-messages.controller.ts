import { ApiBearerAuth, ApiTags , ApiCreatedResponse, ApiOkResponse, ApiParam, ApiNoContentResponse} from "@nestjs/swagger";
import { ScheduledMessagesService } from "./scheduled-messages.service";
import { Controller, UseGuards, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { JwtAuthGuard } from "../jwt/jwt-auth.guard";
import { CurrentAdmin } from "../jwt/decorators/current-user.decorator";
import type { JwtPayload } from "../jwt/jwt.payload";
import { CreateScheduledMessageDto } from "./dto/create-scheduled-message.dto";
import { UpdateScheduledMessageDto } from "./dto/update-scheduled-message.dto";
import { ScheduledMessageResponseDto } from "./dto/scheduled-message.response.dto";

@ApiTags("Scheduled Messages")
@ApiBearerAuth("jwt")
@UseGuards(JwtAuthGuard)
@Controller("scheduled-messages")
export class ScheduledMessagesController {
  constructor(private readonly service: ScheduledMessagesService) { }

  @Post()
  @ApiCreatedResponse({
    description: "Create a new scheduled WhatsApp message",
    type: ScheduledMessageResponseDto,
  })
  create(
    @Body() dto: CreateScheduledMessageDto,
  ) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({
    description: "List all scheduled messages of the authenticated user",
    type: [ScheduledMessageResponseDto],
  })
  findAll(@CurrentAdmin() admin: JwtPayload) {
    return this.service.findAll(admin.sub);
  }

  @Get(":id")
  @ApiParam({ name: "id", description: "Scheduled message ID" })
  @ApiOkResponse({
    description: "Get a scheduled message by ID",
    type: ScheduledMessageResponseDto,
  })
  findOne(
    @CurrentAdmin() admin: JwtPayload,
    @Param("id") id: string,
  ) {
    return this.service.findOne(admin.sub, id);
  }

  @Patch(":id")
  @ApiParam({ name: "id", description: "Scheduled message ID" })
  @ApiOkResponse({
    description: "Update a scheduled message",
    type: ScheduledMessageResponseDto,
  })
  update(
    @CurrentAdmin() admin: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateScheduledMessageDto,
  ) {
    return this.service.update(admin.sub, id, dto);
  }

  @Delete(":id")
  @ApiParam({ name: "id", description: "Scheduled message ID" })
  @ApiNoContentResponse({
    description: "Cancel a scheduled message",
  })
  async cancel(
    @Param("id") id: string,
  ) {
    await this.service.cancel(id);
  }
}
