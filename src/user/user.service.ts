import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ifError } from 'assert';
import { Repository } from 'typeorm';
import { FriendRelation } from './models/friendRelation.model';
import { User } from './models/user.model';

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

  //친구인지 확인
  async isFriend(id, targetId): Promise<boolean> {
    const result = await this.friendRelationRepository.findOne({
      select: ['id'],
      where: [
        { friendReciverId: id, friendRequesterId: targetId, concluded: true },
        { friendReciverId: targetId, friendRequesterId: id, concluded: true },
      ],
    });
    return !!result.id;
  }

  //친구목록 불러오기
  async getFriends(
    id: number,
    take: number = 20,
    page: number = 0,
  ): Promise<User[]> {
    const friendsResult = await this.friendRelationRepository.find({
      select: ['id'],
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
      select: ['id'],
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
      select: ['id'],
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
        { friendRequester: id, concluded: true },
        { friendReciver: id, concluded: true },
      ],
    });
  }

  //친구 신청수 세기
  async countRequestedFriends(id: number): Promise<number> {
    return this.friendRelationRepository.count({
      where: [{ friendRequester: id, concluded: false }],
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
