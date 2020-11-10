import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { TwitterService } from 'src/twitter/twitter.service';
import { ArrayUtil } from 'src/util/util.array';
import { FindManyOptions, Repository } from 'typeorm';
import { FriendRelation } from './models/friendRelation.model';
import { User } from './models/user.model';

export type friendStatusT =
  | 'friended'
  | 'not'
  | 'requested'
  | 'recived'
  | 'self';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(FriendRelation)
    private friendRelationRepository: Repository<FriendRelation>,
    private twitterService: TwitterService,
    private authService: AuthService,
    private array: ArrayUtil,
  ) {}

  //전체사용자 리스트
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  //사용자 찾기
  async findOne(
    id?: number,
    username?: string,
    twitterId?: string,
    twitterToken?: string,
  ): Promise<User> {
    const setFindOne: {
      id?: number;
      username?: string;
      twitterId?: string;
      twitterToken?: string;
    } = {};
    if (arguments.length === 0)
      throw new Error('최소한 한가지 인자가 필요합니다.');
    if (id) setFindOne.id = id;
    if (username) setFindOne.username = username;
    if (twitterId) setFindOne.twitterId = twitterId;
    if (twitterToken) setFindOne.twitterToken = twitterToken;
    return this.userRepository.findOne(setFindOne);
  }

  //친구상태 확인
  async friendStatus(id: number, targetId: number): Promise<friendStatusT> {
    if (id === targetId) return 'self';
    const result = await this.friendRelationRepository.findOne({
      where: [
        { friendReciverId: id, friendRequesterId: targetId },
        { friendReciverId: targetId, friendRequesterId: id },
      ],
    });
    if (!result) return 'not';
    if (result.concluded) return 'friended';
    else if (result.friendRequesterId === id) return 'requested';
    else return 'recived';
  }

  //친구목록 불러오기
  async getFriends(id: number, take?: number, page?: number): Promise<User[]> {
    const findOptions: FindManyOptions<FriendRelation> = {
      select: ['id', 'friendReciverId', 'friendRequesterId'],
      where: [
        { friendRequesterId: id, concluded: true },
        { friendReciverId: id, concluded: true },
      ],
      relations: ['friendReciver', 'friendRequester'],
    };
    if (take && page) {
      findOptions.take = take;
      findOptions.skip = take * page;
    }
    const friendsResult = await this.friendRelationRepository.find(findOptions);
    return friendsResult.map(friend => {
      if (friend.friendReciverId === id) return friend.friendRequester;
      if (friend.friendRequesterId === id) return friend.friendReciver;
    });
  }

  //친구 신청목록 가져오기
  async getRequestedFriends(
    id: number,
    take: number = 20,
    page: number = 0,
  ): Promise<User[]> {
    const result = await this.friendRelationRepository.find({
      select: ['id', 'friendReciverId'],
      where: [{ friendRequesterId: id, concluded: false }],
      relations: ['friendReciver'],
      take,
      skip: take * page,
    });
    return result.map(friend => friend.friendReciver);
  }

  //친구 요청목록 가져오기
  async getRecivedFriends(
    id: number,
    take: number = 20,
    page: number = 0,
  ): Promise<User[]> {
    const result = await this.friendRelationRepository.find({
      select: ['id', 'friendRequesterId'],
      where: [{ friendReciverId: id, concluded: false }],
      relations: ['friendRequester'],
      take,
      skip: take * page,
    });
    return result.map(friend => friend.friendRequester);
  }

  //친구수 세기
  async countFriends(id: number): Promise<number> {
    return this.friendRelationRepository.count({
      where: [
        { friendRequesterId: id, concluded: true },
        { friendReciverId: id, concluded: true },
      ],
    });
  }

  //친구 신청수 세기
  async countRequestedFriends(id: number): Promise<number> {
    return this.friendRelationRepository.count({
      where: [{ friendRequesterId: id, concluded: false }],
    });
  }

  //친구 요청수 세기
  async countRecivedFriends(id: number): Promise<number> {
    return this.friendRelationRepository.count({
      where: [{ friendReciverId: id, concluded: false }],
    });
  }

  //TWITTER API 사용하는 Services

  //친구삭제
  async deleteFriend(user: User, targetId: number) {
    const relation = await this.friendRelationRepository.findOne({
      where: [
        { friendRequesterId: user.id, friendReciverId: targetId },
        { friendRequesterId: targetId, friendReciverId: user.id },
      ],
    });
    this.friendRelationRepository.remove(relation);
  }

  //친구추가(친구요청/친구수락)
  async addFriend(
    user: User,
    targetId: number,
    force: boolean = false,
  ): Promise<boolean> {
    //자기 자신은 친구요청 불가능
    if (user.id === targetId) return false;

    //이미 친구인 상태
    const existRelation = await this.friendRelationRepository.findOne({
      select: ['id'],
      where: [
        {
          friendRequesterId: user.id,
          friendReciverId: targetId,
          concluded: true,
        },
        {
          friendRequesterId: targetId,
          friendReciverId: user.id,
          concluded: true,
        },
      ],
    });
    if (existRelation) return false;

    //이미 친구요청을 받은 상태
    const existRecived = await this.friendRelationRepository.findOne({
      select: ['id'],
      where: {
        friendRequesterId: targetId,
        friendReciverId: user.id,
        concluded: false,
      },
    });
    if (existRecived) {
      //내가 요청받은 상태이므로 친구승락
      try {
        //타겟 유저의 사용자 정보를 받아오기(토큰과 시크릿)
        const targetUser: User = await this.authService.getUserData(targetId);
        //서로 맞팔하기
        await this.twitterService.followUser(user, targetUser.twitterId);
        await this.twitterService.followUser(targetUser, user.twitterId);
      } catch (err) {
        //트위터 API 오류 발생시
        throw err;
      }
      await this.friendRelationRepository.update(existRecived.id, {
        concluded: true,
        concludedAt: new Date(),
      });
      return true;
    }

    //이미 친구요청을 보낸상태
    const existReqeusted = await this.friendRelationRepository.findOne({
      select: ['id'],
      where: {
        friendRequesterId: user.id,
        friendReciverId: targetId,
        concluded: false,
      },
    });
    //강제실행일 경우 상대방 승인없이 친구관계 생성
    if (force) {
      //요청을 보낸상태라면 존재하는 요청 승인
      if (existReqeusted) {
        await this.friendRelationRepository.update(existReqeusted.id, {
          concluded: true,
          concludedAt: new Date(),
        });
        return true;
      }
      //최초의 경우 친구관계 생성
      const forceRelation = await this.friendRelationRepository.create();
      forceRelation.friendRequesterId = user.id;
      forceRelation.friendReciverId = targetId;
      forceRelation.concluded = true;
      forceRelation.concludedAt = new Date();
      await this.friendRelationRepository.save(forceRelation);
      return true;
    }
    //최초 신청인경우 요청만 보내기
    const newRelation = await this.friendRelationRepository.create();
    newRelation.friendRequesterId = user.id;
    newRelation.friendReciverId = targetId;
    await this.friendRelationRepository.save(newRelation);
    return true;
  }

  //트위터 친구목록 동기화
  async syncFriends(user: User) {
    //트위터 맞팔목록 가져온 뒤 User타입으로 노멀라이즈
    const twitterFriendIds = (
      await this.twitterService.getTwitterFriends(user)
    ).map(x => ({
      twitterId: x.id_str,
      username: x.screen_name,
      id: null,
    }));
    const currntFriendIds = (await this.getFriends(user.id)).map(x => ({
      twitterId: x.twitterId,
      username: x.username,
      id: x.id,
    }));

    console.log('twitterFriendIds: ', twitterFriendIds);
    console.log('twifulFriendIds: ', currntFriendIds);

    const {
      diff: { a: willSyncFriends, b: willUnsyncFriends },
    } = this.array.getArraySet(twitterFriendIds, currntFriendIds, 'twitterId');

    console.log('twitterExist: ', willSyncFriends);
    console.log('twitfulExist: ', willUnsyncFriends);

    //트위풀에서만 친구일경우 친구 삭제
    willUnsyncFriends.forEach(targetUser =>
      this.deleteFriend(user, targetUser.id),
    );

    //친구 추가하기
    try {
      await willSyncFriends.forEach(async targetUser => {
        const existsUser = await this.userRepository.findOne({
          twitterId: targetUser.twitterId,
        });
        if (!existsUser) {
          // 동기화된 사용자가 존재하지 않는다면 새로운 비회원 계정 생성 후 친구로 설정
          const newUser = this.userRepository.create();
          newUser.twitterId = targetUser.twitterId;
          newUser.username = targetUser.username;
          const savedUser = await this.userRepository.save(newUser);
          await this.addFriend(user, savedUser.id, true);
        } else {
          // 동기화된 사용자가 존재한다면, 친구로 설정
          await this.addFriend(user, existsUser.id, true);
        }
      });
    } catch (err) {
      throw new Error(err);
    }
    return true;
  }
}
