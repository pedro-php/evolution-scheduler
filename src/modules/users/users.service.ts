import { Injectable, ConflictException } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { UserDto } from "./dto/user.dto";
import { PatchUserDto } from "./dto/patch-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository, private readonly redisService: RedisService) { }

  async create(adminId: string, dto: UserDto): Promise<UserResponseDto> {
    const exists = await this.usersRepository.findByPhone(dto.phone);
    if (exists) throw new ConflictException("Phone already in use");
    return this.usersRepository.create({
      phone: dto.phone,
      name: dto.name,
      admin: {
        connect: { id: adminId },
      },
    });
  }

  findById(id: string): Promise<UserResponseDto | null> {
    return this.usersRepository.findById(id);
  }

  async findByPhone(phone: string): Promise<UserResponseDto | null> {
    const redisPhone = await this.redisService.get<UserResponseDto>(`user:phone:${phone}`);
    if (redisPhone) return redisPhone;
    const phoneUser = await this.usersRepository.findByPhone(phone);
    if (phoneUser) await this.redisService.set(`user:phone:${phone}`, phoneUser);
    return phoneUser;
  }

  async update(id: string, dto: PatchUserDto): Promise<UserResponseDto | null> {
    const data: PatchUserDto = {};

    if (dto.phone) data.phone = dto.phone;
    if (dto.name) data.name = dto.name;

    return this.usersRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}
