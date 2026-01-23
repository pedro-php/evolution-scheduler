import { Test, TestingModule } from '@nestjs/testing';
import { EvolutionApiService } from './evolution-api.service';

describe('EvolutionApiService', () => {
  let service: EvolutionApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvolutionApiService],
    }).compile();

    service = module.get<EvolutionApiService>(EvolutionApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
