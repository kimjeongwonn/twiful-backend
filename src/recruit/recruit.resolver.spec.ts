import { Test, TestingModule } from '@nestjs/testing';
import { RecruitResolver } from './recruit.resolver';

describe('RecruitResolver', () => {
  let resolver: RecruitResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecruitResolver],
    }).compile();

    resolver = module.get<RecruitResolver>(RecruitResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
