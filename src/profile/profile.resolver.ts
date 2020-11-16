import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { User } from '../user/models/user.model';
import { Profile } from './models/profile.model';
import { ProfileService } from './profile.service';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @ResolveField(type => User)
  async user(@Root() root: Profile) {
    return this.profileService.getProfileToUser(root.id);
  }
}
