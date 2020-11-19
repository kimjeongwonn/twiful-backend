import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { Profile } from '../profile/models/profile.model';
import { Recruit } from './models/recruit.model';
import { RecruitService } from './recruit.service';

@Resolver(of => Recruit)
export class RecruitResolver {
  constructor(private readonly recruitService: RecruitService) {}

  @ResolveField(type => Profile)
  host(@Root() root: Recruit) {
    return this.recruitService.getRcruitToProfile(root.id);
  }
}
