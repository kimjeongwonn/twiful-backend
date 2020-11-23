import { UseGuards } from '@nestjs/common';
import {
  Args,
  ArgsType,
  Context,
  Field,
  ID,
  Int,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { Profile } from '../profile/models/profile.model';
import { GqlAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ArrayUtil } from '../util/util.array';
import { FriendStatus } from './models/friendRelation.model';
import { User } from './models/user.model';
import { UserService } from './user.service';
@ArgsType()
class PaginationArgs {
  @Field(type => Int)
  take: number = 20;

  @Field(type => Int)
  page: number = 0;
}

@Resolver(of => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly array: ArrayUtil,
  ) {}

  //필드 리졸버 목록
  @ResolveField(returns => Profile, { nullable: true })
  async profile(@Root() root: User) {
    return this.userService.getUserToProfile(root.id);
  }

  @ResolveField(returns => [User])
  async friends(
    //친구목록 불러오기
    @Root() root: User,
    @Args() { take, page }: PaginationArgs,
    @Context() ctx: Express.Context,
  ): Promise<User[]> {
    return this.userService.getFriends(ctx.req.user, root.id, take, page);
  }

  @ResolveField(returns => Int)
  async friendsCount(@Root() root: User): Promise<number> {
    //친구 수 세기
    return this.userService.countFriends(root.id);
  }

  @ResolveField(returns => [User], { nullable: true })
  async requestedFriends(
    @Root() root: User,
    @Context() ctx: Express.Context,
  ): Promise<User[]> {
    if (root.id !== ctx.req.user.id) return;
    return this.userService.getRequestedFriends(ctx.req.user.id);
  }
  @ResolveField(returns => Int, { nullable: true })
  async requestedFriendsCount(
    @Root() root: User,
    @Context() ctx: Express.Context,
  ): Promise<number> {
    if (root.id !== ctx.req.user.id) return;
    return this.userService.countRequestedFriends(ctx.req.user.id);
  }

  @ResolveField(returns => [User], { nullable: true })
  async receivedFriends(
    @Root() root: User,
    @Context() ctx: Express.Context,
  ): Promise<User[]> {
    if (root.id !== ctx.req.user.id) return;
    return this.userService.getReceivedFriends(ctx.req.user.id);
  }
  @ResolveField(returns => Int, { nullable: true })
  async receivedFriendsCount(
    @Root() root: User,
    @Context() ctx: Express.Context,
  ): Promise<number> {
    if (root.id !== ctx.req.user.id) return;
    return this.userService.countReceivedFriends(ctx.req.user.id);
  }

  @ResolveField(returns => [User])
  async overlappedFriends(
    //겹치는 친구 불러오기
    @Context() ctx: Express.Context,
    @Root() root: User,
  ): Promise<User[]> {
    const myFriends = await this.userService.getFriends(
      ctx.req.user,
      ctx.req.user.id,
    );
    const targetFriends = await this.userService.getFriends(
      ctx.req.user,
      root.id,
    );
    const { inter } = this.array.getArraySet(
      myFriends,
      targetFriends,
      'twitterId',
    );
    return inter;
  }

  @ResolveField(retruns => Boolean) //FR
  isSelf(@Root() root: User, @Context() ctx: Express.Context): boolean {
    return root.id === ctx.req.user.id;
  }

  @ResolveField(returns => FriendStatus) //FR
  async friendStatus(
    @Root() root: User,
    @Context() ctx: Express.Context,
  ): Promise<FriendStatus> {
    return this.userService.friendStatus(ctx.req.user.id, root.id);
  }
  //필드 리졸버 목록 끝
  //쿼리 목록 시작
  @Query(returns => [User])
  async lookAll() {
    return this.userService.findAll();
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns => User)
  async lookMe(@Context() ctx: Express.Context): Promise<User> {
    return this.userService.findOne({ id: ctx.req.user.id });
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns => User)
  async lookUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne({ id });
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns => String)
  async getTwitterUrl(
    @Context() ctx: Express.Context,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.userService.getTwitterUrl(ctx.req.user, id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns => String)
  async test(
    @Context() ctx: Express.Context,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.userService.getTwitterUrl(ctx.req.user, id);
  }
  //쿼리 목록 끝

  //뮤테이션 목록 시작
  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async addFriend(
    @Context() ctx: Express.Context,
    @Args('id', { type: () => Int }) targetId: number,
    @Args('message', { nullable: true }) message?: string,
  ) {
    return this.userService.addFriend(ctx.req.user, targetId, message);
  }

  //TODO:
  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async deleteFriend(
    @Context() ctx: Express.Context,
    @Args('id', { type: () => Int }) targetId: number,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async syncFriends(@Context() ctx: Express.Context) {
    return this.userService.syncFriends(ctx.req.user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async togglePublicTwitterUsername(@Context() ctx: Express.Context) {
    return this.userService.togglePublicTwitterUsername(ctx.req.user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async togglePublicFriends(@Context() ctx: Express.Context) {
    return this.userService.togglePublicFriends(ctx.req.user);
  }
  //뮤테이션 목록 끝
}
