import { Injectable, ConflictException } from "@nestjs/common";
import { UserDto } from "./dto/user.dto";
import { PrismaService } from "src/core/prisma/prisma.service";
import { PatchUserDto } from "./dto/patch-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(adminId: string, dto: UserDto) : Promise<UserResponseDto> {
    const exists = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (exists) {
      throw new ConflictException("Phone already in use");
    }

    return this.prisma.user.create({
      data: {
        phone: dto.phone,
        name: dto.name,
        adminId: adminId
      },
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) : Promise<UserResponseDto | null>{
    return this.prisma.user.findUnique({
      where: { id , del: false },
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async findByPhone(phone: string) : Promise<UserResponseDto | null>{
    return this.prisma.user.findUnique({
      where: { phone, del: false },
       select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: PatchUserDto) : Promise<UserResponseDto | null> {
    const data: PatchUserDto = {};

    if (dto.phone) data.phone = dto.phone;
    if (dto.name) data.name = dto.name;
    
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { del: true },
    });
  }
}
