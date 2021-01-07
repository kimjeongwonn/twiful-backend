import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  MoreThan,
  ObjectID,
  Repository,
} from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { Notice } from '../notice/models/notice.model';
import { ProfileService } from '../profile/profile.service';
import { RecruitService } from '../recruit/recruit.service';
import { TwitterService } from '../twitter/twitter.service';
import { ArrayUtil } from '../util/util.array';
import { FriendRelation, FriendStatus } from './models/friendRelation.model';
import { User } from './models/user.model';
import { PaginationArgs } from './user.resolver';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(FriendRelation)
    private friendRelationRepository: Repository<FriendRelation>,
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
    private recruitService: RecruitService,
    private twitterService: TwitterService,
    private authService: AuthService,
    private profileService: ProfileService,
    private array: ArrayUtil,
  ) {}

  //전체사용자 리스트
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  //사용자 찾기
  findOne(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<User>,
  ): Promise<User | undefined>;
  findOne(options?: FindOneOptions<User>): Promise<User | undefined>;
  findOne(
    conditions?: FindConditions<User>,
    options?: FindOneOptions<User>,
  ): Promise<User | undefined>;
  async findOne(...args): Promise<User> {
    return this.userRepository.findOne(...args);
  }

  async getUserToProfile(id) {
    //연결된 프로필 가져오기
    return this.profileService.findOne({ user: { id } });
  }

  async getUserToNotice(user: User) {
    return this.noticeRepository.find({ where: { to: user } });
  }

  //친구상태 확인
  async friendStatus(id: number, targetUserId: number): Promise<FriendStatus> {
    if (id === targetUserId) return { status: 'self' };
    const result = await this.friendRelationRepository.findOne({
      where: [
        { friendReceiverId: id, friendRequesterId: targetUserId },
        { friendReceiverId: targetUserId, friendRequesterId: id },
      ],
    });
    if (!result) return { status: 'not' };
    if (result.concluded) return { status: 'friended' };
    else if (result.friendRequesterId === id)
      return { status: 'requested', message: result.message };
    else return { status: 'received', message: result.message };
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
    targetUserId: number,
    page: PaginationArgs = { take: 20, cursor: 0 },
  ): Promise<User[]> {
    if (user.id !== targetUserId) {
      //타인의 친구목록을 볼 때는 검증을 거침
      const { publicFriends, profile } = await this.userRepository.findOne(
        targetUserId,
        {
          //대상의 친구공개여부 확인
          select: ['id', 'publicFriends'],
          relations: ['profile'],
        },
      );
      const validRcruit = await this.recruitService.validRecruit(profile);
      if (
        !(
          validRcruit ||
          publicFriends ||
          (await this.friendStatus(user.id, targetUserId)).status === 'friended'
        )
      )
        //셋 중 하나도 아니라면
        throw new Error('친구목록을 볼 수 있는 권한이 없습니다');
    }
    const findOptions: FindManyOptions<FriendRelation> = {
      where: [
        {
          friendRequesterId: targetUserId,
          concluded: true,
          id: MoreThan(page.cursor),
        },
        {
          friendReceiverId: targetUserId,
          concluded: true,
          id: MoreThan(page.cursor),
        },
      ],
      relations: ['friendReceiver', 'friendRequester'],
      take: page.take,
    };
    const friendsResult = await this.friendRelationRepository.find(findOptions);
    return friendsResult.map(friend => {
      if (friend.friendReceiverId === targetUserId)
        return friend.friendRequester;
      if (friend.friendRequesterId === targetUserId)
        return friend.friendReceiver;
    });
  }

  async overlappedFriends(user: User, targetUserId: number) {
    const validRcruit = await this.recruitService.validRecruit(
      await user.getProfile(),
    );
    if (
      !(
        validRcruit ||
        user.publicFriends ||
        (await this.friendStatus(user.id, targetUserId)).status === 'friended'
      )
    )
      //셋 중 하나도 아니라면
      throw new Error('친구목록을 볼 수 있는 권한이 없습니다');
    const myFriends = await this.getFriends(user, user.id);
    const targetFriends = await this.getFriends(user, targetUserId);
    const { inter } = this.array.getArraySet(
      myFriends,
      targetFriends,
      'twitterId',
    );
    return inter;
  }

  //친구 신청목록 가져오기
  async getRequestedFriends(id: number, getRelations?: boolean) {
    const result = await this.friendRelationRepository.find({
      select: ['id', 'friendReceiverId'],
      where: { friendRequesterId: id, concluded: false },
      relations: ['friendReceiver'],
    });
    return getRelations ? result : result.map(friend => friend.friendReceiver);
  }

  //친구 요청목록 가져오기
  async getReceivedFriends(userId: number, getRelations?: boolean) {
    const result = await this.friendRelationRepository.find({
      select: ['id', 'friendRequesterId'],
      where: { friendReceiverId: userId, concluded: false },
      relations: ['friendRequester'],
    });
    return getRelations ? result : result.map(friend => friend.friendRequester);
  }

  //친구수 세기
  async countFriends(id: number): Promise<number> {
    return this.friendRelationRepository.count({
      where: [
        { friendRequesterId: id, concluded: true },
        { friendReceiverId: id, concluded: true },
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
  async countReceivedFriends(id?: number): Promise<number> {
    return this.friendRelationRepository.count({
      where: [{ friendReceiverId: id, concluded: false }],
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

  //트위터 API 사용

  //트위터 링크 받아오기
  async getTwitterUrl(rawUser: User, targetUserId: number) {
    const targetUser = await this.userRepository.findOne(targetUserId, {
      select: ['id', 'twitterId', 'publicTwitterUsername'],
    });
    if (!targetUser) throw new Error('존재하지 않는 사용자');
    const user = await this.authService.getUserData(rawUser.id); //트위터 토큰 가져오기
    if (user.id === targetUserId) {
      //자신의 URL 가져오기(가능하면 지양)
      return this.twitterService.getTwitterUrl(user, user.twitterId);
    }
    const validRcruit = this.recruitService.validRecruit(
      await rawUser.getProfile(),
    );
    if (
      !(
        targetUser.publicTwitterUsername ||
        validRcruit ||
        (await this.friendStatus(user.id, targetUserId)).status === 'friended'
      )
    )
      throw new Error('트위터 링크를 볼 수 있는 권한이 없습니다'); //권한 없음
    return this.twitterService.getTwitterUrl(user, targetUser.twitterId);
  }

  //친구삭제
  async deleteFriend(rawUser: User, targetUserId: number, both?: boolean) {
    const relation = await this.friendRelationRepository.findOne({
      where: [
        { friendRequesterId: rawUser.id, friendReceiverId: targetUserId },
        { friendRequesterId: targetUserId, friendReceiverId: rawUser.id },
      ],
    });
    const user = await this.authService.getUserData(rawUser.id);
    const targetAuthedUser = await this.authService.getUserData(
      targetUserId,
      //상대방 인증정보를 받아와서
    );
    if (both) {
      //만약 양쪽에서 해제해야 한다면
      if (targetAuthedUser.twitterToken) {
        //트위터 계정이 연결되어 있다면 언팔로우
        await this.twitterService.unfollowUser(
          targetAuthedUser,
          user.twitterId,
        );
      } else console.error(new Error('상대방이 트위풀에 계정이 없음'));
    }
    //both옵션을 통해 상대방도 나를 언팔로우
    await this.twitterService.unfollowUser(user, targetAuthedUser.twitterId);
    return this.friendRelationRepository.remove(relation);
  }

  async findFriendRelation(
    userId: number,
    targetUserId: number,
    method: 'friended' | 'requested' | 'received' | 'yet',
  ) {
    let where;
    switch (method) {
      case 'friended':
        where = [
          {
            friendRequesterId: userId,
            friendReceiverId: targetUserId,
            concluded: true,
          },
          {
            friendRequesterId: targetUserId,
            friendReceiverId: userId,
            concluded: true,
          },
        ];
        break;
      case 'requested':
        where = {
          friendRequesterId: userId,
          friendReceiverId: targetUserId,
          concluded: false,
        };
        break;
      case 'received':
        where = {
          friendRequesterId: targetUserId,
          friendReceiverId: userId,
          concluded: false,
        };
        break;
      case 'yet':
        where = [
          {
            friendRequesterId: userId,
            friendReceiverId: targetUserId,
            concluded: false,
          },
          {
            friendRequesterId: targetUserId,
            friendReceiverId: userId,
            concluded: false,
          },
        ];
      default:
        throw new Error('잘못된 메소드 입니다!');
    }
    return this.friendRelationRepository.findOne({
      where,
    });
  }

  //친구추가(친구요청/친구수락)
  async addFriend(
    rawUser: User,
    targetUserId: number,
    message?: string,
    force?: boolean,
  ): Promise<boolean> {
    //자기 자신은 친구요청 불가능
    if (rawUser.id === targetUserId)
      throw new Error('자기 자신을 친구추가 할 수 없습니다.');

    //이미 친구인 상태 확인
    const existRelation = await this.findFriendRelation(
      rawUser.id,
      targetUserId,
      'friended',
    );
    //이미 친구라면 에러
    if (existRelation) throw new Error('이미 친구입니다');

    //이미 친구요청을 받은 상태 확인
    const existReceived = await this.findFriendRelation(
      rawUser.id,
      targetUserId,
      'received',
    );
    if (existReceived) {
      //내가 요청받은 상태이므로 친구승락
      try {
        //타겟 유저의 사용자 정보를 받아오기(토큰과 시크릿)
        const user = await this.authService.getUserData(rawUser.id);
        const targetUser = await this.authService.getUserData(targetUserId);
        const myStatus = await this.twitterService.relationCheck(
          targetUser,
          user.twitterId,
        );
        const targetStatus = await this.twitterService.relationCheck(
          user,
          targetUser.twitterId,
        );
        if (myStatus === 'blocked' || targetStatus === 'blocked')
          throw new Error('차단된 계정');
        //서로 맞팔하기
        await this.twitterService.followUser(targetUser, user.twitterId);
        await this.twitterService.followUser(user, targetUser.twitterId);
        const newNotice = await this.noticeRepository.create({
          from: targetUser,
          to: user,
          type: 'ACCEPT_FRIEND_REQUEST',
        });
        await this.noticeRepository.save(newNotice);
      } catch (err) {
        //트위터 API 오류 발생시
        if (err[0].code === 162) {
          await this.friendRelationRepository.remove(existReceived);
          throw new Error('차단된 계정');
        }
        throw err;
      }
      await this.friendRelationRepository.update(existReceived.id, {
        concluded: true,
        concludedAt: new Date(),
      });
      return true;
    }

    //이미 친구요청을 보낸상태
    const existReqeusted = await this.findFriendRelation(
      rawUser.id,
      targetUserId,
      'requested',
    );
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
        friendReceiverId: targetUserId,
        concluded: true,
        concludedAt: new Date(),
      });
      await this.friendRelationRepository.save(forceRelation);
      return true;
    } else if (existReqeusted) {
      throw new Error('이미 친구 요청을 보냈습니다');
    }
    //최초 신청인경우 요청만 보내기
    if (!(await this.recruitService.validRecruit(await rawUser.getProfile())))
      //내 트친소 검사
      throw new Error('트친소를 공개해야 친구요청을 할 수 있습니다.');
    const targetProfile = await this.profileService.findOne({
      user: { id: targetUserId },
    });
    if (!(await this.recruitService.validRecruit(targetProfile)))
      //상대방 트친소 검사
      throw new Error(
        '트친소를 공개한 사용자에게만 친구요청을 할 수 있습니다.',
      );
    const user = await this.authService.getUserData(rawUser.id);
    const targetUser = await this.authService.getUserData(targetUserId);
    let relationToSelf: 'blocked' | 'clear' | 'protected' | 'follwing';
    let relationToTarget: 'blocked' | 'clear' | 'protected' | 'follwing';
    //내가 차단당했나 확인한뒤, 상대방이 나를 차단했나 확인
    if (
      (relationToSelf = await this.twitterService.relationCheck(
        targetUser,
        user.twitterId,
      )) === 'blocked' ||
      (relationToTarget = await this.twitterService.relationCheck(
        user,
        targetUser.twitterId,
      )) === 'blocked'
    )
      throw new Error(
        '차단하거나 차단당한 사용자에게는 친구요청을 할 수 없습니다.',
      );
    else if (relationToSelf === 'protected')
      throw new Error('계정 프로텍트를 풀어야 친구요청을 할 수 있습니다.');
    else if (relationToTarget === 'protected')
      throw new Error(
        '상대방의 계정이 프로텍트 상태이기 때문에 친구요청을 할 수 없습니다.',
      );
    const newRelation = await this.friendRelationRepository.create({
      friendRequesterId: rawUser.id,
      friendReceiverId: targetUserId,
      message: message,
    });
    await this.friendRelationRepository.save(newRelation);
    const newNotice = await this.noticeRepository.create({
      from: user,
      to: targetUser,
      type: 'SEND_FRIEND_REQUEST',
    });
    await this.noticeRepository.save(newNotice);
    return true;
  }

  async cancelFriendRequest(user: User, targetUserId: number) {
    //친구 상태확인
    const { status } = await this.friendStatus(user.id, targetUserId);
    if (status === 'received' || status === 'requested') {
      const willCancelRelation = await this.findFriendRelation(
        user.id,
        targetUserId,
        'yet',
      );
      return this.friendRelationRepository.remove(willCancelRelation);
    } else throw new Error('친구신청 상태에서만 가능합니다!');
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

    return true;
  }
}
