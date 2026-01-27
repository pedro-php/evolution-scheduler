import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { Prisma, Instance } from "@prisma/client";

@Injectable()
export class InstancesRepository {
    constructor(private readonly prisma: PrismaService) { }

    findById(id: string): Promise<Instance | null> {
        return this.prisma.instance.findUnique({ where: { id } });
    }

    findByName(name: string): Promise<Instance | null> {
        return this.prisma.instance.findUnique({ where: { name } });
    }

    findByAdmin(adminId: string): Promise<Instance[]> {
        return this.prisma.instance.findMany({ where: { adminId } });
    }

    create(data: Prisma.InstanceCreateInput): Promise<Instance> {
        return this.prisma.instance.create({ data });
    }

    patchByName(name: string, data: Prisma.InstanceUpdateInput): Promise<Instance> {
        return this.prisma.instance.update({
            where: { name },
            data: data,
        });
    }

    softDelete(id: string): Promise<Instance> {
        return this.prisma.instance.update({
            where: { id },
            data: { del: true },
        });
    }
}
