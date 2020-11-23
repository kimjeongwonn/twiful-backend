import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Int,
  Mutation,
  registerEnumType,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Profile } from '../profile/models/profile.model';
import { Taste } from '../taste/models/taste.model';
import { Review } from './models/review.model';
import { ReviewService } from './review.service';

export enum reviewType {
  toTaste = 'toTaste',
  toProfile = 'toProfile',
}

registerEnumType(reviewType, {
  name: 'reviewType',
});
@InputType()
export class ReviewInputType {
  @Field(type => Int)
  toId: number;
  @Field(type => reviewType)
  toType: reviewType;
  @Field({ nullable: true })
  text?: string;
}

@Resolver(of => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @ResolveField(type => Profile)
  async author(@Root() root: Review) {
    return this.reviewService.getReviewToAuthor(root);
  }
  @ResolveField(type => Profile)
  async toProfile(@Root() root: Review) {
    return this.reviewService.getReviewToProfile(root);
  }

  @ResolveField(type => Taste)
  async toTaste(@Root() root: Review) {
    return this.reviewService.getReviewToTaste(root);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(retruns => Review)
  async writeReview(
    @Context() ctx: Express.Context,
    @Args('data') data: ReviewInputType,
  ) {
    return this.reviewService.writeReview(ctx.req.user, data);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(retruns => Boolean)
  async deleteReview(@Context() ctx: Express.Context, @Args('id') id: number) {
    return this.reviewService.deleteReview(ctx.req.user, id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(retruns => String)
  async editReview(
    @Context() ctx: Express.Context,
    @Args('id') id: number,
    @Args('text') text: string,
  ) {
    return this.reviewService.editReview(ctx.req.user, id, text);
  }
}
