import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { Profile } from '../profile/models/profile.model';
import { ProfileService } from '../profile/profile.service';
import { TwitterService } from '../twitter/twitter.service';
import { ArrayUtil } from '../util/util.array';
import { FriendRelation, FriendStatus } from './models/friendRelation.model';
import { User } from './models/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(FriendRelation)
    private friendRelationRepository: Repository<FriendRelation>,
    private profileService: ProfileService,
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
    conditions?: FindConditions<User>,
    options?: FindOneOptions<User>,
  ): Promise<User> {
    return this.userRepository.findOne(conditions, options);
  }

  async getUserToProfile(id) {
    //연결된 프로필 가져오기
    const currentUser = await this.userRepository.findOne(id, {
      select: ['id'],
      relations: ['profile'],
    });
    return currentUser.profile;
  }

  //친구상태 확인
  async friendStatus(id: number, targetId: number): Promise<FriendStatus> {
    if (id === targetId) return { status: 'self' };
    const result = await this.friendRelationRepository.findOne({
      where: [
        { friendReciverId: id, friendRequesterId: targetId },
        { friendReciverId: targetId, friendRequesterId: id },
      ],
    });
    if (!result) return { status: 'not' };
    if (result.concluded) return { status: 'friended' };
    else if (result.friendRequesterId === id)
      return { status: 'requested', message: result.message };
    else return { status: 'recived', message: result.message };
  }

  //친구목록 공개 토글
  async togglePublicFriends(user: User) {
    const current = (
      await this.userRepository.findOne(user.id, {
        select: ['publicFriends'],
      })
    ).publicFriends;
    this.userRepository.update(user.id, {
      publicFriends: !current,
    });
    return !current;
  }

  //친구목록 불러오기
  async getFriends(
    user: User,
    targetId: number,
    take?: number,
    page?: number,
  ): Promise<User[]> {
    if (user.id !== targetId) {
      //자기 자신을 확인하는 경우에는 검증없이 진행
      const { publicFriends } = await this.userRepository.findOne(targetId, {
        //대상의 친구공개여부 확인
        select: ['id', 'publicFriends'],
      });
      const friendStatus = await this.friendStatus(user.id, targetId); //대상과 친구인지 확인
      if (!(publicFriends || friendStatus.status === 'friended'))
        //둘 중 하나라도 아니라면
        throw new UnauthorizedException(); //권한 없음
    }
    const findOptions: FindManyOptions<FriendRelation> = {
      select: ['id', 'friendReciverId', 'friendRequesterId'],
      where: [
        { friendRequesterId: targetId, concluded: true },
        { friendReciverId: targetId, concluded: true },
      ],
      relations: ['friendReciver', 'friendRequester'],
    };
    if (take && page) {
      findOptions.take = take;
      findOptions.skip = take * page;
    }
    const friendsResult = await this.friendRelationRepository.find(findOptions);
    return friendsResult.map(friend => {
      if (friend.friendReciverId === targetId) return friend.friendRequester;
      if (friend.friendRequesterId === targetId) return friend.friendReciver;
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
  async countRecivedFriends(id?: number): Promise<number> {
    return this.friendRelationRepository.count({
      where: [{ friendReciverId: id, concluded: false }],
    });
  }

  async togglePublicTwitterUsername(user: User) {
    const current = (
      await this.userRepository.findOne(user.id, {
        select: ['publicTwitterUsername'],
      })
    ).publicTwitterUsername;
    this.userRepository.update(user.id, {
      publicTwitterUsername: !current,
    });
    return !current;
  }

  //TWITTER API 사용하는 Services

  //트위터 링크 받아오기
  async getTwitterUrl(rawUser: User, targetId: number) {
    const targetUser = await this.userRepository.findOne(targetId, {
      select: ['id', 'twitterId', 'publicTwitterUsername'],
    });
    if (!targetUser) throw new Error('존재하지 않는 사용자');
    const user = await this.authService.getUserData(rawUser.id); //트위터 토큰 가져오기
    if (user.id === targetId) {
      //자신의 URL 가져오기(가능하면 지양)
      return this.twitterService.getTwitterUrl(user, user.twitterId);
    }
    let targetProfile: Profile;
    try {
      targetProfile = await this.profileService.findOne(null, {
        where: { user: targetUser },
        select: ['id'],
        relations: ['recruit'],
      });
    } catch {}
    const friendStatus = await this.friendStatus(user.id, targetId);
    if (
      !(
        targetUser.publicTwitterUsername ||
        targetProfile?.recruit ||
        (await friendStatus.status) === 'friended'
      )
    )
      throw new UnauthorizedException(); //권한 없음
    return this.twitterService.getTwitterUrl(user, targetUser.twitterId);
  }

  //친구삭제
  async deleteFriend(rawUser: User, targetUser: User, both?: boolean) {
    try {
      const relation = await this.friendRelationRepository.findOne({
        where: [
          { friendRequesterId: rawUser.id, friendReciverId: targetUser.id },
          { friendRequesterId: targetUser.id, friendReciverId: rawUser.id },
        ],
      });
      const user = await this.authService.getUserData(rawUser.id);
      if (both) {
        //만약 양쪽에서 해제해야 한다면
        const targetAuthedUser = await this.authService.getUserData(
          targetUser.id,
          //상대방 인증정보를 받아와서
        );
        if (targetAuthedUser.twitterToken) {
          //트위터 계정이 연결되어 있다면 언팔로우
          await this.twitterService.unfollowUser(
            targetAuthedUser,
            user.twitterId,
          );
        } else throw new Error('상대방이 트위풀에 계정이 없음');
      }

      //both옵션을 통해 상대방도 나를 언팔로우
      await this.twitterService.unfollowUser(user, targetUser.twitterId);
      return this.friendRelationRepository.remove(relation);
    } catch (err) {
      throw err;
    }
  }

  //친구추가(친구요청/친구수락)
  async addFriend(
    rawUser: User,
    targetId: number,
    message?: string,
    force?: boolean,
  ): Promise<boolean> {
    //자기 자신은 친구요청 불가능
    if (rawUser.id === targetId)
      throw new Error('자기 자신을 친구추가 할 수 없습니다.');

    //이미 친구인 상태 확인
    const existRelation = await this.friendRelationRepository.findOne({
      select: ['id'],
      where: [
        {
          friendRequesterId: rawUser.id,
          friendReciverId: targetId,
          concluded: true,
        },
        {
          friendRequesterId: targetId,
          friendReciverId: rawUser.id,
          concluded: true,
        },
      ],
    });
    //이미 친구라면 에러
    if (existRelation) throw new Error('이미 친구입니다');

    //이미 친구요청을 받은 상태 확인
    const existRecived = await this.friendRelationRepository.findOne({
      select: ['id'],
      where: {
        friendRequesterId: targetId,
        friendReciverId: rawUser.id,
        concluded: false,
      },
    });
    if (existRecived) {
      //내가 요청받은 상태이므로 친구승락
      try {
        //타겟 유저의 사용자 정보를 받아오기(토큰과 시크릿)
        const user = await this.authService.getUserData(rawUser.id);
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
        friendRequesterId: rawUser.id,
        friendReciverId: targetId,
        concluded: false,
      },
    });
    //강제실행일 경우 상대방 승인없이 친구관계 생성 (트위터 API 연동 없음)
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
      const forceRelation = await this.friendRelationRepository.create({
        friendRequesterId: rawUser.id,
        friendReciverId: targetId,
        concluded: true,
        concludedAt: new Date(),
      });
      await this.friendRelationRepository.save(forceRelation);
      return true;
    } else if (existReqeusted) {
      throw new Error('이미 친구 요청을 보냈습니다');
    }
    //최초 신청인경우 요청만 보내기
    const newRelation = await this.friendRelationRepository.create({
      friendRequesterId: rawUser.id,
      friendReciverId: targetId,
      message: message,
    });
    await this.friendRelationRepository.save(newRelation);
    return true;
  }

  //트위터 친구목록 동기화
  async syncFriends(rawUser: User) {
    //트위터 맞팔목록 가져온 뒤 User타입으로 노멀라이즈
    const user = await this.authService.getUserData(rawUser.id);
    const twitterFriendIds = (
      await this.twitterService.getTwitterFriends(user)
    ).map(x => ({
      twitterId: x.id_str,
      username: x.screen_name,
      id: null,
    }));
    const currntFriendIds = (await this.getFriends(user, user.id)).map(x => ({
      twitterId: x.twitterId,
      username: x.username,
      id: x.id,
    }));

    const {
      diff: { a: willUnsyncFriends, b: willSyncFriends },
    } = this.array.getArraySet(currntFriendIds, twitterFriendIds, 'twitterId');

    //트위풀에서만 친구일경우 친구 삭제
    willUnsyncFriends.forEach(targetUser =>
      this.deleteFriend(user, targetUser),
    );

    //친구 추가하기
    try {
      await willSyncFriends.forEach(async targetUser => {
        const existsUser = await this.userRepository.findOne({
          twitterId: targetUser.twitterId,
        });
        if (!existsUser) {
          // 동기화된 사용자가 존재하지 않는다면 새로운 비회원 계정 생성 후 친구로 설정
          const newUser = await this.userRepository.create({
            twitterId: targetUser.twitterId,
            username: targetUser.username,
          });
          const savedUser = await this.userRepository.save(newUser);
          await this.addFriend(user, savedUser.id, null, true);
        } else {
          // 동기화된 사용자가 존재한다면, 친구로 설정
          await this.addFriend(user, existsUser.id, null, true);
        }
      });
    } catch (err) {
      throw new Error(err);
    }
    return true;
  }
}
