import { Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Taste } from './models/taste.model';
import { TasteService } from './taste.service';

@Resolver(of => Taste)
export class TasteResolver {
  constructor(private readonly tasteService: TasteService) {}

  @ResolveField(type => [Taste]) //FR
  recommends(): Taste[] {
    return;
  }

  @Query(returns => Taste)
  async lookAllTaste() {
    return this.tasteService.findAll();
  }
}
