import { Module } from '@nestjs/common';
import { InstancesService } from './instances.service';
import { InstancesController } from './instances.controller';
import { InstancesRepository } from './instances.repository';
import { EvolutionApiModule } from '../evolution-api/evolution-api.module';

@Module({
  controllers: [InstancesController],
  providers: [InstancesService, InstancesRepository],
  imports: [EvolutionApiModule],
  exports: [InstancesService],
})
export class InstancesModule {}
