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
    twitterToken?: string,
  ): Promise<User> {
    const setFindOne: {
      id?: number;
      username?: string;
      twitterToken?: string;
    } = {};
    if (arguments.length === 0)
      throw new Error('최소한 한가지 인자가 필요합니다.');
    if (id) setFindOne.id = id;
    if (username) setFindOne.username = username;
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

  //친구추가(친구요청/친구수락)
  async addFriend(
    user: User,
    targetId: number,
    force: boolean = false,
  ): Promise<boolean> {
    if (force) {
      const forceRelation = await this.friendRelationRepository.create();
      forceRelation.friendRequesterId = user.id;
      forceRelation.friendReciverId = targetId;
      forceRelation.concluded = true;
      forceRelation.concludedAt = new Date();
      await this.friendRelationRepository.save(forceRelation);
      return true;
    }
    if (user.id === targetId) return false;
    //자기 자신은 친구요청 불가능
    const existRelation = await this.friendRelationRepository.findOne({
      select: ['id'],
      where: { friendRequesterId: user.id, friendReciverId: targetId },
    });
    if (existRelation) return false;
    //이미 친구요청 상태
    const existRequest = await this.friendRelationRepository.findOne({
      select: ['id'],
      where: { friendRequesterId: targetId, friendReciverId: user.id },
    });
    if (existRequest) {
      //내가 요청받은 상태이므로 친구승락
      try {
        //타겟 유저의 사용자 정보를 받아오기(토큰과 시크릿)
        const targetUser: User = await this.authService.getUserData(targetId);
        //서로 맞팔하기
        await this.twitterService.followUser(user, targetUser);
        await this.twitterService.followUser(targetUser, user);
      } catch (err) {
        //트위터 API 오류 발생시
        throw err;
      }
      await this.friendRelationRepository.update(existRequest.id, {
        concluded: true,
        concludedAt: new Date(),
      });
      return true;
    }
    //최초 신청인 경우
    const newRelation = await this.friendRelationRepository.create();
    newRelation.friendRequesterId = user.id;
    newRelation.friendReciverId = targetId;
    await this.friendRelationRepository.save(newRelation);
    return true;
  }

  //트위터 친구목록 동기화
  async syncFriends(user: User) {
    interface compareUser {
      id: number;
      twitterId: string;
    }

    //트위터 맞팔목록 가져오기
    const willSyncFriends = await this.twitterService.getTwitterFriends(user);
    //현재 친구목록 가져오기
    const currntFriends = await this.getFriends(user.id);
    const [interFriends, diffFriends] = this.array.getArraySet(
      willSyncFriends,
      currntFriends,
    );
    if (diffFriends.length) {
    }

    //트위풀 친구와, 트위터 맞팔을 비교하여
    //트위터에 효율적으로 동기화 다시하기
    //차집합이 있으면 친구 해제
    //합집합이 있으면 친구 추가 생략

    //친구 추가하기
    try {
      await interFriends.forEach(async twitterUser => {
        const existsUser = await this.userRepository.findOne({
          twitterId: twitterUser.id_str,
        });
        if (!existsUser) {
          // 동기화된 사용자가 존재하지 않는다면 새로운 비회원 계정 생성 후 친구로 설정
          const newUser = this.userRepository.create();
          newUser.twitterId = twitterUser.id_str;
          newUser.username = twitterUser.screen_name;
          const savedUser = await this.userRepository.save(newUser);
          await this.addFriend(user, savedUser.id, true);
        } else {
          // 동기화된 사용자가 존재한다면, 친구로 설정
          await this.addFriend(user, existsUser.id, true);
        }
      });
    } catch (err) {
      throw err;
    }
    return true;
  }
}
