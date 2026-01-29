import { Injectable, NotFoundException } from "@nestjs/common";
import { InstancesRepository } from "./instances.repository";
import { EvolutionApiService } from "../evolution-api/evolution-api.service";
import { JwtPayload } from "../jwt/jwt.payload";
import { CreateInstanceDto } from "../evolution-api/dto/create-instance.dto";
import { Instance, Prisma } from "@prisma/client";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class InstancesService {
    constructor(
        private readonly instancesRepository: InstancesRepository,
        private readonly evolutionService: EvolutionApiService,
        private readonly redisService: RedisService,
    ) { }

    async create(user: JwtPayload, dto: CreateInstanceDto) {
        const evolutionInstance = await this.evolutionService.createInstance(dto);

        return this.instancesRepository.create({
            apiKey: process.env.EVOLUTION_API_KEY!,
            name: evolutionInstance.instanceName,
            url: process.env.EVOLUTION_API_URL!,
            admin: {
                connect: {
                    id: user.sub,
                },
            },
        });
    }

    async patchInstanceByName(name: string, dto: Prisma.InstanceUpdateInput) {
        return this.instancesRepository.patchByName(name, dto);
    }

    async delete(id: string) {
        const instance = await this.instancesRepository.findById(id);
        if (!instance) {
            throw new NotFoundException("Instance not found");
        }

        await this.evolutionService.delete(instance.name);
        return this.instancesRepository.softDelete(id);
    }

    async findByName(name: string) {
        const redisInstance = await this.redisService.get<Instance>(`instance:${name}`);
        if (redisInstance) return redisInstance;
        const instance = await this.instancesRepository.findByName(name);
        await this.redisService.set<Instance>(`instance:${name}`, instance!);
        return instance;
    }

    findById(id: string) {
        return this.instancesRepository.findById(id);
    }

    findByAdmin(adminId: string) {
        return this.instancesRepository.findByAdmin(adminId);
    }
}
