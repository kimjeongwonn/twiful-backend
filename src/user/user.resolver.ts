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
  ArgsType,
  Field,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from './models/user.model';
import { friendStatusT, UserService } from './user.service';

@ArgsType()
class PaginationArgs {
  @Field(type => Int)
  take: number = 20;

  @Field(type => Int)
  page: number = 0;
}

@Resolver(of => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField(type => [User]) //FR
  async friends(
    @Root() root: User,
    @Args() { take, page }: PaginationArgs,
  ): Promise<User[]> {
    return this.userService.getFriends(root.id, take, page);
  }

  @ResolveField(type => Int)
  async friendsCount(@Root() root: User): Promise<number> {
    return this.userService.countFriends(root.id);
  }

  @ResolveField(type => [User]) //FR
  overlappedFriends(): User[] {
    return;
  }
  //구현해야함

  @ResolveField() //FR
  isSelf(@Root() root: User, @Context() ctx: Express.Context): boolean {
    return root.id === ctx.req.user.id;
  }

  @ResolveField(type => String) //FR
  async friendStatus(
    @Root() root: User,
    @Context() ctx: Express.Context,
  ): Promise<friendStatusT> {
    return this.userService.friendStatus(ctx.req.user.id, root.id);
  }

  @Query(returns => [User])
  async lookAll() {
    return this.userService.findAll();
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns => User, { description: 'return my User account' })
  async lookMe(@Context() ctx: Express.Context): Promise<User> {
    return this.userService.findOne(ctx.req.user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns => User)
  async lookUser(@Args('id', { type: () => ID }) id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async addFriend(
    @Context() ctx: Express.Context,
    @Args('targetId') targetId: number,
  ) {
    return this.userService.addFriend(ctx.req.user, targetId);
  }

  @Mutation(returns => Boolean)
  async syncFriends() {
    return true;
  }
}
