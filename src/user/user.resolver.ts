import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(returns => User)
  async lookAll() {
    return this.userService.findAll();
  }

  @Query(returns => User, { description: 'return my User account' })
  async lookMe() {
    return '';
  }

  @Query(returns => User)
  async lookUser(@Args('userId', { type: () => ID }) id: string) {
    return '';
  }

  @Mutation(returns => User)
  async createUser(@Args('username') username: string) {
    return this.userService.createUser(username);
  }

  @Mutation(returns => Boolean)
  async removeUser() {
    return true;
  }

  @Mutation(returns => Boolean)
  async syncFriends() {
    return true;
  }
}
