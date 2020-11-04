import { HttpService, UseGuards, Req } from '@nestjs/common';
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
import { GqlAuthGuard, JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
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

  @UseGuards(GqlAuthGuard)
  @Query(returns => User)
  async authTest(@Context() ctx: Express.Context) {
    return ctx.req.user;
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
