import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "../jwt/jwt.service";
import { AuthResponseDto } from "./dto";
import { UserDto } from "../users/dto/user.dto";

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService
  ) {}

  async register(user: UserDto): Promise<AuthResponseDto> {
    const exists = await this.users.findByEmail(user.email);
    if (exists) throw new ConflictException();

    const createdUser = await this.users.create({email: user.email, password: user.password}); 
    return { access_token: this.jwt.sign({ sub: createdUser.id, email: createdUser.email }) };
  }

  async login(login: UserDto): Promise<AuthResponseDto> {
    const {user, match} = await this.users.doesUserPasswordMatch(login);
    if (!match || !user) throw new UnauthorizedException("Invalid credentials");   
     return { access_token: this.jwt.sign({ sub: user.id, email: user. email }) };
  }
}
