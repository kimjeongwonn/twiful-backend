import {
  Args,
  Context,
  ResolveField,
  Resolver,
  Root,
  Query,
  Mutation,
} from '@nestjs/graphql';
import { User } from '../user/models/user.model';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';
import { ProfileService } from './profile.service';

@Resolver(of => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @ResolveField(type => User)
  async user(@Root() root: Profile) {
    return this.profileService.getProfileToUser(root.id);
  }

  @Mutation(type => String, { nullable: true })
  async editProfile(@Args('bio') bio: string, @Context() ctx: Express.Context) {
    return this.profileService.editProfile(ctx.req.user, { bio });
  }
  @Mutation(type => Link)
  async addLink(
    @Args('url') url: string,
    @Args('type') type: string,
    @Context() ctx: Express.Context,
  ) {
    return this.profileService.addLink(ctx.req.user, { url, type });
  }
  @Mutation(type => Boolean)
  async editLink(
    @Context() ctx: Express.Context,
    @Args('url', { nullable: true }) url?: string,
    @Args('type', { nullable: true }) type?: string,
  ) {
    return this.profileService.editLink(ctx.req.user, { url, type });
  }
}
