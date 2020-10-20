import { Test, TestingModule } from '@nestjs/testing';
import { TasteResolver } from './taste.resolver';

describe('TasteResolver', () => {
  let resolver: TasteResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasteResolver],
    }).compile();

    resolver = module.get<TasteResolver>(TasteResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
