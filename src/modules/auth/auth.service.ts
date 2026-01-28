import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "../jwt/jwt.service";
import { AuthResponseDto } from "./dto";
import { AdminsService } from "../admins/admins.service";
import { AdminDto } from "../admins/dto/admin.dto";

@Injectable()
export class AuthService {
  constructor(
    private admins: AdminsService,
    private jwt: JwtService
  ) {}

  async register(admin: AdminDto): Promise<AuthResponseDto> {
    const exists = await this.admins.findByEmail(admin.email);
    if (exists) throw new ConflictException();

    const createdUser = await this.admins.create({email: admin.email, password: admin.password}); 
    return { access_token: this.jwt.sign({ sub: createdUser.id, email: createdUser.email }) };
  }

  async login(login: AdminDto): Promise<AuthResponseDto> {
    const {user: admin, match} = await this.admins.doesUserPasswordMatch(login);
    if (!match || !admin) throw new UnauthorizedException("Invalid credentials");   
     return { access_token: this.jwt.sign({ sub: admin.id, email: admin.email }) };
  }
}
