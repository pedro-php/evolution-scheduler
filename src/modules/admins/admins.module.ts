import { Module } from "@nestjs/common";
import { AdminsService } from "./admins.service";
import { AdminsRepository } from "./admins.repository";
import { PrismaModule } from "src/core/prisma/prisma.module";
import { AdminsController } from "./admins.controller";

@Module({
  imports: [PrismaModule],
  providers: [AdminsService, AdminsRepository],
  controllers: [AdminsController],
  exports: [AdminsService],
})
export class AdminsModule {}
