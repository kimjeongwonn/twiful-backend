import { Resolver } from '@nestjs/graphql';
import { TasteService } from './taste.service';

@Resolver()
export class TasteResolver {
  constructor(private readonly tasteService: TasteService) {}
}
