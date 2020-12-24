import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Int,
  Mutation,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { Taste } from '../taste/models/taste.model';
import { GqlAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Profile } from '../profile/models/profile.model';
import { Recruit } from './models/recruit.model';
import { RecruitService } from './recruit.service';

@InputType()
export class RecruitInput {
  @Field(type => Date, { nullable: true })
  toDate?: Date;
  @Field(type => String, { nullable: true })
  caption?: string;
}

@InputType()
export class TasteSetInput {
  @Field(type => [Int])
  likeIds: number[];

  @Field(type => [Int])
  dislikeIds: number[];
}

@Resolver(of => Recruit)
export class RecruitResolver {
  constructor(private readonly recruitService: RecruitService) {}

  @ResolveField(returns => Profile)
  async host(@Root() root: Recruit) {
    return this.recruitService.getRcruitToProfile(root.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async startRecruit(
    @Context() ctx: Express.Context,
    @Args('data', { nullable: true }) data?: RecruitInput,
  ) {
    return this.recruitService.startRecruit(ctx.req.user, data);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async endRecruit(@Context() ctx: Express.Context) {
    return this.recruitService.endRecruit(ctx.req.user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async setTaste(
    @Context() ctx: Express.Context,
    @Args('tasteIds') tasteIds: TasteSetInput,
  ) {
    return this.recruitService.setTaste(ctx.req.user, tasteIds);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(retruns => [Profile])
  async getRecommendedRecruits(@Context() ctx: Express.Context) {
    return this.recruitService.getRecommendedRecruits(ctx.req.user);
  }
}
