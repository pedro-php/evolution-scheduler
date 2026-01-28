import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "../jwt/jwt.module";
import { AdminsModule } from "../admins/admins.module";

@Module({
  imports: [AdminsModule, JwtModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
