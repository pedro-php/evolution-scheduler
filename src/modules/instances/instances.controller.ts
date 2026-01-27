import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from "@nestjs/swagger";

import { InstancesService } from "./instances.service";
import { CreateInstanceDto } from "../evolution-api/dto/create-instance.dto";
import type { JwtPayload } from "../jwt/jwt.payload";
import { JwtAuthGuard } from "../jwt/jwt-auth.guard";
import { CurrentUser } from "../jwt/decorators/current-user.decorator";
@ApiTags("Instances")
@ApiBearerAuth("jwt")
@UseGuards(JwtAuthGuard)
@Controller("instances")
export class InstancesController {
  constructor(private readonly instancesService: InstancesService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new instance",
    description: "Creates an Evolution instance and persists it locally",
  })
  @ApiResponse({
    status: 201,
    description: "Instance created successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInstanceDto,
  ) {
    return this.instancesService.create(user, dto);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get instance by id",
  })
  @ApiParam({
    name: "id",
    description: "Instance UUID",
  })
  @ApiResponse({
    status: 200,
    description: "Instance found",
  })
  @ApiResponse({
    status: 404,
    description: "Instance not found",
  })
  findById(@Param("id") id: string) {
    return this.instancesService.findById(id);
  }

  @Get()
  @ApiOperation({
    summary: "List instances of the authenticated admin",
  })
  @ApiResponse({
    status: 200,
    description: "Instances retrieved successfully",
  })
  findMyInstances(@CurrentUser() user: JwtPayload) {
    return this.instancesService.findByAdmin(user.sub);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete (soft delete) an instance",
    description: "Deletes the Evolution instance and marks it as deleted locally",
  })
  @ApiParam({
    name: "id",
    description: "Instance UUID",
  })
  @ApiResponse({
    status: 200,
    description: "Instance deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Instance not found",
  })
  delete(@Param("id") id: string) {
    return this.instancesService.delete(id);
  }
}
