import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(
    id?: number,
    username?: string,
    twitterToken?: string,
  ): Promise<User> {
    return;
  }

  async findRelation(): Promise<User[]> {
    return this.userRepository.find({ relations: ['friends'] });
  }

  async createUser(username): Promise<User> {
    const newUser = this.userRepository.create();
    newUser.username = username;
    return this.userRepository.save(newUser);
  }
}
