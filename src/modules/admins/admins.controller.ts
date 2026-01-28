import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
} from "@nestjs/swagger";
import { AdminsService } from "./admins.service";
import { JwtAuthGuard } from "../jwt/jwt-auth.guard";
import { CurrentAdmin } from "../jwt/decorators/current-user.decorator";
import { AdminResponseDto } from "./dto/admin-response.dto";
import { PatchAdminDto } from "./dto/patch-admin.dto";
import type { JwtPayload } from "../jwt/jwt.payload";

@ApiTags("Admins")
@ApiBearerAuth("jwt")
@UseGuards(JwtAuthGuard)
@Controller("admins")
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get("me")
  @ApiOkResponse({ type: AdminResponseDto })
  async me(@CurrentAdmin() admin: JwtPayload) {
    return this.adminsService.findById(admin.sub);
  }

  @Patch("me")
  @ApiOkResponse({ type: AdminResponseDto })
  async updateMe(
    @CurrentAdmin() admin: JwtPayload,
    @Body() dto: PatchAdminDto,
  ) {
    return this.adminsService.update(admin.sub, dto);
  }
}
