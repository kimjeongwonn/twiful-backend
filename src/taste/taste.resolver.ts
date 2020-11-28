import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { Review } from '../review/models/review.model';
import { GqlAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Profile } from '../profile/models/profile.model';
import { Taste } from './models/taste.model';
import { TasteService } from './taste.service';

export enum tasteMethod {
  like = 'likers',
  dislike = 'dislikers',
}

registerEnumType(tasteMethod, {
  name: 'tasteMethod',
});
@InputType()
class TasteInput {
  @Field()
  name: string;

  @Field(type => tasteMethod)
  method: tasteMethod;
}

@Resolver(of => Taste)
export class TasteResolver {
  constructor(private readonly tasteService: TasteService) {}

  @ResolveField(returns => [Profile])
  async likers(@Root() root: Taste) {
    return this.tasteService.getTasteToLikersOrDislikers(root, 'likes');
  }
  @ResolveField(returns => [Profile])
  async likersCount(@Root() root: Taste) {
    return this.tasteService.getTasteToLikersOrDislikers(root, 'likes', true);
  }

  // @ResolveField(returns => [Profile])
  // async dislikers(@Root() root: Taste) {
  //   return this.tasteService.getTasteToLikersOrDislikers(root, 'dislikes');
  // }
  // 싫어요 목록은 볼 수 없음

  @ResolveField(returns => [Profile])
  async dislikersCount(@Root() root: Taste) {
    return this.tasteService.getTasteToLikersOrDislikers(
      root,
      'dislikes',
      true,
    );
  }

  @ResolveField(returns => [Review])
  async reviews(@Root() root: Taste) {
    return this.tasteService.getTasteToReview(root);
  }
  @ResolveField(returns => Boolean)
  async isLike(@Context() ctx: Express.Context, @Root() root: Taste) {
    return this.tasteService.isRelation(ctx.req.user, root, false);
  }
  @ResolveField(returns => Boolean)
  async isDislike(@Context() ctx: Express.Context, @Root() root: Taste) {
    return this.tasteService.isRelation(ctx.req.user, root, true);
  }

  @ResolveField(returns => [Taste]) //FR
  recommends(): Taste[] {
    return;
  }

  @Query(returns => Taste)
  async lookAllTaste() {}

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async addTaste(
    @Args('data') data: TasteInput,
    @Context() ctx: Express.Context,
  ) {
    return this.tasteService.addTaste(ctx.req.user, data);
  }
}
