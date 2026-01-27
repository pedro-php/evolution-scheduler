import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { AdminDto } from "./dto/admin.dto";

@Injectable()
export class AdminsRepository {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.admin.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.admin.findUnique({ where: { id } });
  }

  create(user: AdminDto) {
    return this.prisma.admin.create({
      data: { email: user.email, password: user.password },
    });
  }
}
