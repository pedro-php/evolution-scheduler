import { Test, TestingModule } from '@nestjs/testing';
import { EvolutionApiController } from './evolution-api.controller';
import { EvolutionApiService } from './evolution-api.service';

describe('EvolutionApiController', () => {
  let controller: EvolutionApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvolutionApiController],
      providers: [EvolutionApiService],
    }).compile();

    controller = module.get<EvolutionApiController>(EvolutionApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
