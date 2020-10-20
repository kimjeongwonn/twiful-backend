import { Test, TestingModule } from '@nestjs/testing';
import { TasteService } from './taste.service';

describe('TasteService', () => {
  let service: TasteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasteService],
    }).compile();

    service = module.get<TasteService>(TasteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
