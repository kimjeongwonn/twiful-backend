import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './models/user.model';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async createUser(username): Promise<User> {
    const newUser = this.userRepository.create();
    newUser.username = username;
    return this.userRepository.save(newUser);
  }
}
