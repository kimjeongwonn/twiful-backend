import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Profile } from '../profile/models/profile.model';
import { Recruit } from './models/recruit.model';
import { RecruitService } from './recruit.service';

@InputType()
export class RecruitInput {
  @Field({ nullable: true })
  toDate?: Date;
  @Field({ nullable: true })
  caption?: string;
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
}
