import { HttpService, Req } from '@nestjs/common';
import {
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
  ResolveField,
  Int,
  Root,
  Context,
} from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';

@Resolver(of => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly httpService: HttpService,
  ) {}

  @ResolveField(type => [User]) //FR
  friends(@Root() root: User): User[] {
    return;
  }

  @ResolveField(type => Int)
  friendsCount(): number {
    return;
  }

  @ResolveField(type => [User]) //FR
  overlappedFriends(): User[] {
    return;
  }

  @ResolveField() //FR
  isSelf(): boolean {
    return;
  }

  @ResolveField() //FR
  isFriend(): boolean {
    return;
  }

  @Query(returns => User)
  async lookAll() {
    return this.userService.findAll();
  }

  @Query(returns => User)
  async getToken(@Context() ctx: Express.Request) {
    return ctx.user;
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
