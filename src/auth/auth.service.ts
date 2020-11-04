import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/models/user.model';
import { Connection, Repository } from 'typeorm';
import { Profile } from 'src/profile/models/profile.model';
import { includedUserData } from './twitter.strategy';
import { JwtService } from '@nestjs/jwt';
const AES = require('crypto-js/aes');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(User) private profileRepo: Repository<Profile>,
    private connection: Connection,
    private jwtService: JwtService,
  ) {}

  async getUserData(userId) {
    return this.userRepo.findOne(userId, { relations: ['profile'] });
  }

  async validateUser(twitterId: string): Promise<User | null> {
    const currUser = await this.userRepo.findOne({
      where: { twitterId },
    });
    return currUser;
  }
  async validateProfile(twitterToken: string): Promise<User | null> {
    const currUser = await this.userRepo.findOne({
      where: { twitterToken },
    });
    return currUser;
  }

  async createUser(twitterUser: includedUserData): Promise<User> {
    const { twitterId, username } = twitterUser;
    const newUser = this.userRepo.create();
    newUser.twitterId = twitterId;
    newUser.username = username;
    return this.userRepo.save(newUser);
  }

  async createProfile(
    userId: number,
    twitterUser: includedUserData,
  ): Promise<User> {
    const { twitterToken, twitterSecret } = twitterUser;
    const key = process.env.TWITTER_API_SECRET_ENCRYPTION_KEY;
    const encryptedTwitterSecret = AES.encrypt(twitterSecret, key).toString();
    // const encryptedTwitterSecret = twitterSecret;

    let resultProfile: Profile;
    await this.connection.transaction(async manager => {
      await manager.update(User, userId, {
        twitterToken,
        twitterSecret: encryptedTwitterSecret,
      });
      const connectUser = await manager.findOne(User, userId);
      const newProfile = await manager.create(Profile);
      newProfile.user = connectUser;
      newProfile.lastLoginAt = new Date();
      resultProfile = await manager.save(newProfile);
    });
    return resultProfile.user;
  }

  async createUserandProfile(twitterUser: includedUserData): Promise<User> {
    const { twitterId, username, twitterToken, twitterSecret } = twitterUser;
    const key = process.env.TWITTER_API_SECRET_ENCRYPTION_KEY;
    const encryptedTwitterSecret = AES.encrypt(twitterSecret, key).toString();
    // const encryptedTwitterSecret = twitterSecret;

    let resultProfile: Profile;

    await this.connection.transaction(async manager => {
      const newUser = await manager.create(User);
      newUser.twitterId = twitterId;
      newUser.username = username;
      newUser.twitterToken = twitterToken;
      newUser.twitterSecret = encryptedTwitterSecret;
      const newProfile = await manager.create(Profile);
      newProfile.user = newUser;
      newProfile.lastLoginAt = new Date();
      resultProfile = await manager.save(newProfile);
    });
    return resultProfile.user;
  }

  signToken(user) {
    const payload = { id: user.id, twitterId: user.twitterId };
    return this.jwtService.sign(payload);
  }
}
