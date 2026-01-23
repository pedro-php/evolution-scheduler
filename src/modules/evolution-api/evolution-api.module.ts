import { Module } from '@nestjs/common';
import { EvolutionApiService } from './evolution-api.service';
import { EvolutionApiController } from './evolution-api.controller';
import { EvolutionHttpAdapter } from './evolution-api-adapter';

@Module({
  controllers: [EvolutionApiController],
  providers: [EvolutionApiService, EvolutionHttpAdapter],
  exports: [EvolutionApiService, EvolutionHttpAdapter]
})
export class EvolutionApiModule {}
