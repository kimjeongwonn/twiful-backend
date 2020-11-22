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

  @ResolveField(type => [Profile])
  async likers(@Root() root: Taste) {
    return this.tasteService.getTasteToLikers(root);
  }

  @ResolveField(type => [Profile])
  async dislikers(@Root() root: Taste) {
    return this.tasteService.getTasteToDislikers(root);
  }

  @ResolveField(type => [Taste]) //FR
  recommends(): Taste[] {
    return;
  }

  @Query(returns => Taste)
  async lookAllTaste() {}

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async likeTasteToggle(
    @Args('data') data: TasteInput,
    @Context() ctx: Express.Context,
  ) {
    return this.tasteService.likeTasteToggle(ctx.req.user, data);
  }
}
