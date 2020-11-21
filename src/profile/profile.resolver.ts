import { UseGuards } from '@nestjs/common';
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
import { GqlAuthGuard } from '../auth/guards/jwt-auth.guard';
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
    return this.profileService.getProfileToUser(root);
  }
  @ResolveField(type => Recruit)
  async recruit(@Root() root: Profile) {
    return this.profileService.getProfileToRecruit(root);
  }
  @ResolveField(type => [Link])
  async link(@Root() root: Profile) {
    return this.profileService.getProfileToLink(root);
  }
  @ResolveField(type => [Link])
  async likes(@Root() root: Profile) {
    return this.profileService.getProfileToLikes(root);
  }
  @ResolveField(type => [Link])
  async dislikes(@Root() root: Profile) {
    return this.profileService.getProfileToDislikes(root);
  }

  @ResolveField(type => Boolean)
  async validRecruit(@Root() root: Profile) {
    return this.recruitService.validRecruit(root);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(type => String, { nullable: true })
  async editProfile(
    @Args('data') data: ProfileEditInput,
    @Context() ctx: Express.Context,
  ) {
    return this.profileService.editProfile(ctx.req.user, data);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(type => Link)
  async addLink(
    @Context() ctx: Express.Context,
    @Args('data') data?: UrlInput,
  ) {
    return this.profileService.addLink(ctx.req.user, data);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(type => Boolean)
  async editLink(
    @Context() ctx: Express.Context,
    @Args('data') data?: UrlInput,
  ) {
    return this.profileService.editLink(ctx.req.user, data);
  }
}
