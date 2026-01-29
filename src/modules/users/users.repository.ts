import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id, del: false },
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    });
  }

  findByPhone(phone: string) {
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

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
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

  softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { del: true },
    });
  }
}
