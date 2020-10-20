import { Resolver, Query } from '@nestjs/graphql';
import { User } from '../models/user.model';
import { UserService } from './user.service';

@Resolver(of => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(returns => String)
  hello() {
    return 'HELLO';
  }
}
