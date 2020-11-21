import { Query, ResolveField, Resolver, Root } from '@nestjs/graphql';
import { Profile } from '../profile/models/profile.model';
import { Taste } from './models/taste.model';
import { TasteService } from './taste.service';

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
}
