import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Query,
  UseGuards,
  NotFoundException,
  Delete,
  Param,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../jwt/jwt-auth.guard";
import { CurrentAdmin } from "../jwt/decorators/current-user.decorator";
import { UserResponseDto } from "./dto/user-response.dto";
import { PatchUserDto } from "./dto/patch-user.dto";
import { UserDto } from "./dto/user.dto";
import type { JwtPayload } from "../jwt/jwt.payload";

@ApiTags("Users")
@ApiBearerAuth("jwt")
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  @Post()
  @ApiCreatedResponse({ type: UserResponseDto })
  async create(@CurrentAdmin() admin: JwtPayload, @Body() dto: UserDto): Promise<UserResponseDto> {
    return this.usersService.create(admin.sub, dto);
  }

  @Get()
  @ApiQuery({ name: "phone", required: true })
  @ApiOkResponse({ type: UserResponseDto })
  async findByPhone(
    @Query("phone") phone: string,
  ): Promise<UserResponseDto> {
    const result = await this.usersService.findByPhone(phone);

    if (!result) {
      throw new NotFoundException("User not found");
    }

    return result;
  }

  @Patch(":id")
  @ApiOkResponse({ type: UserResponseDto })
  async update(@Param("id") id: string,@Body() dto: PatchUserDto): Promise<UserResponseDto | null> {
    return this.usersService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<void> {
    return this.usersService.delete(id);
  }
}
