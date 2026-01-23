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
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../jwt/jwt-auth.guard";
import { CurrentUser } from "../jwt/decorators/current-user.decorator";
import { UserResponseDto } from "./dto/user-response.dto";
import { PatchUserDto } from "./dto/patch-user.dto";
import type { JwtPayload } from "../jwt/jwt.payload";

@ApiTags("Users")
@ApiBearerAuth("jwt")
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOkResponse({ type: UserResponseDto })
  async me(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Patch("me")
  @ApiOkResponse({ type: UserResponseDto })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PatchUserDto,
  ) {
    return this.usersService.update(user.sub, dto);
  }
}
