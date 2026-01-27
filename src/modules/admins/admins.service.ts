import { Injectable, ConflictException } from "@nestjs/common";
import { AdminDto } from "./dto/admin.dto";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/core/prisma/prisma.service";
import { PatchAdminDto } from "./dto/patch-admin.dto";
import { AdminResponseDto } from "./dto/admin-response.dto";
import { PasswordMatchResponseDto } from "./dto/password-match-response.dto";

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: AdminDto) : Promise<AdminResponseDto> {
    const exists = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException("Email already in use");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.admin.create({
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

  async findById(id: string) : Promise<AdminResponseDto | null>{
    return this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) : Promise<AdminResponseDto | null>{
    return this.prisma.admin.findUnique({
      where: { email },
       select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async doesUserPasswordMatch(dto: AdminDto) : Promise<PasswordMatchResponseDto> {
    const admin =  await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });
    if (!admin) return {match: false};

    const match = await bcrypt.compare(dto.password, admin.password);

    return {user: admin, match: match};
  }

  async update(id: string, dto: PatchAdminDto) : Promise<AdminResponseDto | null> {
    const data: PatchAdminDto = {};

    if (dto.email) data.email = dto.email;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    

    return this.prisma.admin.update({
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
