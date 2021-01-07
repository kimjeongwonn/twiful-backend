import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Int,
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
import { PaginationArgs } from 'src/user/user.resolver';

export enum tasteMethod {
  like = 'like',
  dislike = 'dislike',
}

registerEnumType(tasteMethod, {
  name: 'tasteMethod',
});
@InputType()
class TasteInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  id?: number;

  @Field(type => tasteMethod)
  method: tasteMethod;
}

@Resolver(of => Taste)
export class TasteResolver {
  constructor(private readonly tasteService: TasteService) {}

  @ResolveField(returns => [Profile])
  async likers(@Root() root: Taste) {
    return this.tasteService.getTasteToLikersOrDislikers(root, 'like');
  }
  @ResolveField(returns => Int)
  async likersCount(@Root() root: Taste) {
    return this.tasteService.getTasteToLikersOrDislikers(root, 'like', true);
  }

  // @ResolveField(returns => [Profile])
  // async dislikers(@Root() root: Taste) {
  //   return this.tasteService.getTasteToLikersOrDislikers(root, 'dislikes');
  // }
  // 싫어요 목록은 볼 수 없음

  @ResolveField(returns => Int)
  async dislikersCount(@Root() root: Taste) {
    return this.tasteService.getTasteToLikersOrDislikers(root, 'dislike', true);
  }

  @ResolveField(returns => [Review])
  async reviews(@Root() root: Taste) {
    return this.tasteService.getTasteToReview(root);
  }

  @ResolveField(returns => String)
  async isRelation(@Context() ctx: Express.Context, @Root() root: Taste) {
    return this.tasteService.isRelation(ctx.req.user, root);
  }

  @ResolveField(returns => [Taste]) //FR
  recommends(): Taste[] {
    return;
  }

  @Query(returns => Taste)
  async lookAllTaste() {}

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async toggleTaste(
    @Args('data') data: TasteInput,
    @Context() ctx: Express.Context,
  ) {
    return this.tasteService.toggleTaste(ctx.req.user, data);
  }

  @Mutation(returns => [Taste])
  async findTaste(
    @Args('keyword') keyword: string,
    @Args('page', { nullable: true }) page?: PaginationArgs,
  ) {
    return this.tasteService.findTaste(keyword, page);
  }
}
