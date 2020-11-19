import {
  Args,
  Context,
  ResolveField,
  Resolver,
  Root,
  Query,
  Mutation,
  InputType,
  Field,
} from '@nestjs/graphql';
import { Recruit } from '../recruit/models/recruit.model';
import { RecruitService } from '../recruit/recruit.service';
import { User } from '../user/models/user.model';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';
import { ProfileService } from './profile.service';

@InputType()
class UrlInput {
  @Field({ nullable: true })
  url: string;

  @Field({ nullable: true })
  type: string;
}

@InputType()
class ProfileEditInput {
  @Field({ nullable: true })
  bio: string;
}

@Resolver(of => Profile)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private recruitService: RecruitService,
  ) {}

  @ResolveField(type => User)
  async user(@Root() root: Profile) {
    return this.profileService.getProfileToUser(root.id);
  }
  @ResolveField(type => Recruit)
  async recruit(@Root() root: Profile) {
    return this.profileService.getProfileToRecruit(root.id);
  }

  @ResolveField(type => Boolean)
  async validRecruit(@Root() root: Profile) {
    return this.recruitService.validRecruit(root);
  }

  @Mutation(type => String, { nullable: true })
  async editProfile(
    @Args('data') data: ProfileEditInput,
    @Context() ctx: Express.Context,
  ) {
    return this.profileService.editProfile(ctx.req.user, data);
  }
  @Mutation(type => Link)
  async addLink(
    @Context() ctx: Express.Context,
    @Args('data') data?: UrlInput,
  ) {
    return this.profileService.addLink(ctx.req.user, data);
  }
  @Mutation(type => Boolean)
  async editLink(
    @Context() ctx: Express.Context,
    @Args('data') data?: UrlInput,
  ) {
    return this.profileService.editLink(ctx.req.user, data);
  }
}
