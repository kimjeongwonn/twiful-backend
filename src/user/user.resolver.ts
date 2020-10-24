import {
  Resolver,
  Query,
  Args,
  ID,
  Int,
  ResolveField,
  Mutation,
  Parent,
  registerEnumType,
} from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';

enum FriendRelation {
  FRIEND,
  SENT,
  RECEIVED,
  NONE,
}

registerEnumType(FriendRelation, {
  name: 'FriendRelation',
});

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // @ResolveField(returns => User)
  // async friends(@Parent() user: User) {
  //   const { id } = user;
  //   return id;
  // }

  // @ResolveField(returns => Int)
  // async friendsCount(@Parent() user: User) {
  //   const { friends } = user;
  //   return friends.length + 1;
  // }

  // @ResolveField(returns => User)
  // async friendRequest(@Parent() user: User) {
  //   const { id } = user;
  //   return id;
  // }

  // @ResolveField(returns => User)
  // async overfriendRequest(@Parent() user: User) {
  //   const { id } = user;
  //   return id;
  // }

  // @ResolveField(returns => User)
  // async blockedRequest(@Parent() user: User) {
  //   const { id } = user;
  //   return id;
  // }

  // @ResolveField(returns => Boolean)
  // async isSelf(@Parent() user: User) {
  //   return !!user;
  // }

  // @ResolveField(returns => FriendRelation)
  // async isFriend(@Parent() user: User) {
  //   return 'NONE';
  // }

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

  // @Mutation(returns => User)
  // async createUser(
  //   @Args('twitterId', { type: () => Int }) twitterId: number,
  //   @Args('profileId', { type: () => ID }) profileId: string,
  // ) {
  //   return '';
  // }

  @Mutation(returns => Boolean)
  async removeUser() {
    return true;
  }

  @Mutation(returns => Boolean)
  async syncFriends() {
    return true;
  }
}
