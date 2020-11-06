import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  async getFriends(
    id: number,
    take: number = 20,
    page: number = 0,
  ): Promise<User[]> {
    const friendsResult = await this.friendRelationRepository.find({
      select: ['id', 'friendReciverId', 'friendRequesterId'],
      where: [
        { friendRequesterId: id, concluded: true },
        { friendReciverId: id, concluded: true },
      ],
      relations: ['friendReciver', 'friendRequester'],
      take,
      skip: take * page,
    });
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

  //친구추가(친구요청/친구수락)
  async addFriend(id: number, targetId: number): Promise<boolean> {
    if (id === targetId) return false;
    const existRelation = await this.friendRelationRepository.findOne({
      select: ['id'],
      where: { friendRequesterId: id, friendReciverId: targetId },
    });
    console.log(existRelation);
    if (existRelation) return false; //이미 친구요청 상태
    const existRequest = await this.friendRelationRepository.findOne({
      select: ['id'],
      where: { friendRequesterId: targetId, friendReciverId: id },
    });
    if (existRequest) {
      //내가 요청받은 상태이므로 친구승락
      await this.friendRelationRepository.update(existRequest.id, {
        concluded: true,
        concludedAt: new Date(),
      });
      return true;
    }
    const newRelation = await this.friendRelationRepository.create();
    newRelation.friendRequesterId = id;
    newRelation.friendReciverId = targetId;
    await this.friendRelationRepository.save(newRelation);
    return true;
  }
}
