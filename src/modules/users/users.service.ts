import { Injectable, ConflictException } from "@nestjs/common";
import { UserDto } from "./dto/user.dto";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/core/prisma/prisma.service";
import { PatchUserDto } from "./dto/patch-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { User } from "@prisma/client";
import { PasswordMatchResponseDto } from "./dto/password-match-response.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: UserDto) : Promise<UserResponseDto> {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException("Email already in use");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) : Promise<UserResponseDto | null>{
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) : Promise<UserResponseDto | null>{
    return this.prisma.user.findUnique({
      where: { email },
       select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async doesUserPasswordMatch(dto: UserDto) : Promise<PasswordMatchResponseDto> {
    const user =  await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) return {match: false};

    const match = await bcrypt.compare(dto.password, user.password);

    return {user: user, match: match};
  }

  async update(id: string, dto: PatchUserDto) : Promise<UserResponseDto | null> {
    const data: PatchUserDto = {};

    if (dto.email) data.email = dto.email;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }
}
