import { Resolver } from '@nestjs/graphql';
import { RecruitService } from './recruit.service';

@Resolver()
export class RecruitResolver {
  constructor(private readonly recruitService: RecruitService) {}
}
