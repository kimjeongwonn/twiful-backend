import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/models/user.model';
import { Connection, Repository } from 'typeorm';
import { Profile } from 'src/profile/models/profile.model';
import { includedUserData } from './twitter.strategy';
import { JwtService } from '@nestjs/jwt';
const AES = require('crypto-js/aes');
const ENC = require('crypto-js').enc;

@Injectable()
export class AuthService {
  private AES_KEY: string = process.env.TWITTER_API_SECRET_ENCRYPTION_KEY;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private connection: Connection,
    private jwtService: JwtService,
  ) {}

  //userID에서 토큰 가져오기
  async getUserData(userId) {
    const user = await this.userRepository.findOne(userId, {
      relations: ['profile'],
    });
    return {
      ...user,
      twitterSecret: AES.decrypt(user.twitterSecret, this.AES_KEY).toString(
        ENC.Utf8,
      ),
    };
  }

  async validateUser(twitterId: string): Promise<User | null> {
    const currUser = await this.userRepository.findOne({
      where: { twitterId },
    });
    return currUser;
  }
  async validateProfile(twitterToken: string): Promise<User | null> {
    const currUser = await this.userRepository.findOne({
      where: { twitterToken },
    });
    return currUser;
  }

  async createUser(twitterUser: includedUserData): Promise<User> {
    const { twitterId, username } = twitterUser;
    const newUser = this.userRepository.create();
    newUser.twitterId = twitterId;
    newUser.username = username;
    return this.userRepository.save(newUser);
  }

  async createProfile(
    userId: number,
    twitterUser: includedUserData,
  ): Promise<User> {
    const { twitterToken, twitterSecret } = twitterUser;
    const encryptedTwitterSecret = AES.encrypt(
      twitterSecret,
      this.AES_KEY,
    ).toString();
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
    console.log(twitterSecret);
    const encryptedTwitterSecret = AES.encrypt(
      twitterSecret,
      this.AES_KEY,
    ).toString();
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
