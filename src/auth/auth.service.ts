import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/models/user.model';
import { Connection, FindOneOptions, Repository } from 'typeorm';
import { Profile } from '../profile/models/profile.model';
import { includedUserData } from './twitter.strategy';
import { JwtService } from '@nestjs/jwt';
import { Recruit } from '../recruit/models/recruit.model';
const AES = require('crypto-js/aes');
const ENC = require('crypto-js').enc;

@Injectable()
export class AuthService {
  private AES_KEY: string = process.env.TWITTER_API_SECRET_ENCRYPTION_KEY;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    private connection: Connection,
    private jwtService: JwtService,
  ) {}

  //유저데이터 가져오기 (토큰제외)
  async getUser(userId: number) {
    const user = await this.userRepository.findOne(userId);
    if (!user) throw new UnauthorizedException();
    const getProfile = async (option?: FindOneOptions<Profile>) =>
      this.profileRepository.findOne({ user: user }, option);
    return { ...user, getProfile };
  }

  //유저데이터 가져오기 (복호화)
  async getUserData(userId: number): Promise<User> {
    const user = await this.userRepository.findOne(userId);
    return {
      ...user,
      twitterSecret: AES.decrypt(user.twitterSecret, this.AES_KEY).toString(
        ENC.Utf8,
      ),
    };
  }

  //로그인 시간 추가
  async loginDateAdd(profile) {
    const result = await this.profileRepository.update(
      { id: profile.id },
      {
        lastLoginAt: new Date(),
      },
    );
    return !!result.affected;
  }

  //존재하는 계정 확인 및 반환
  async validateUser(twitterId: string): Promise<User | null> {
    const currUser = await this.userRepository.findOne({
      where: { twitterId },
    });
    return currUser;
  }

  //존재하는 프로필 확인 및 계정과 프로필 반환
  async validateProfile(twitterToken: string): Promise<User | null> {
    const currUser = await this.userRepository.findOne({
      where: { twitterToken },
      relations: ['profile'],
    });
    return currUser;
  }

  //사용자 계정 만들기
  async createUser(twitterUser: includedUserData): Promise<User> {
    const { twitterId, username } = twitterUser;
    const newUser = this.userRepository.create();
    newUser.twitterId = twitterId;
    newUser.username = username;
    return this.userRepository.save(newUser);
  }

  //프로파일 생성
  async createProfile(
    userId: number,
    twitterUser: includedUserData,
  ): Promise<User> {
    const { twitterToken, twitterSecret } = twitterUser;
    const encryptedTwitterSecret = AES.encrypt(
      twitterSecret,
      this.AES_KEY,
    ).toString();

    let resultProfile: Profile;
    await this.connection.transaction(async manager => {
      await manager.update(User, userId, {
        twitterToken,
        twitterSecret: encryptedTwitterSecret,
      });
      const connectUser = await manager.findOne(User, userId);
      const newRcruit = await manager.create(Recruit);
      const newProfile = await manager.create(Profile, {
        user: connectUser,
        recruit: newRcruit,
        lastLoginAt: new Date(),
      });
      resultProfile = await manager.save(newProfile);
    });
    return resultProfile.user;
  }

  //사용자계정과 프로필 함께 생성
  async createUserandProfile(twitterUser: includedUserData): Promise<User> {
    const { twitterId, username, twitterToken, twitterSecret } = twitterUser;
    const encryptedTwitterSecret = AES.encrypt(
      twitterSecret,
      this.AES_KEY,
    ).toString();

    let resultProfile: Profile;

    await this.connection.transaction(async manager => {
      const newUser = await manager.create(User);
      newUser.twitterId = twitterId;
      newUser.username = username;
      newUser.twitterToken = twitterToken;
      newUser.twitterSecret = encryptedTwitterSecret;
      const newRcruit = await manager.create(Recruit);
      const newProfile = await manager.create(Profile, {
        user: newUser,
        recruit: newRcruit,
        lastLoginAt: new Date(),
      });
      resultProfile = await manager.save(newProfile);
    });
    return resultProfile.user;
  }

  //JWT 생성
  signToken(user) {
    const payload = { id: user.id, twitterId: user.twitterId };
    return this.jwtService.sign(payload);
  }
}
