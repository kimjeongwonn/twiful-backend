import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as Twitter } from 'passport-twitter';
import { User } from '../user/models/user.model';
import { AuthService } from './auth.service';

export interface includedUserData extends Partial<User> {
  profileImage: string;
}

@Injectable()
export class TwitterStrategy extends PassportStrategy(Twitter) {
  constructor(private readonly authService: AuthService) {
    super({
      forceLogin: true,
      consumerKey: process.env.TWITTER_API_KEY,
      consumerSecret: process.env.TWITTER_API_SECRET,
      callbackURL: process.env.TWITTER_API_CALLBACK,
    });
  }

  async validate(token: string, secret: string, profile: any) {
    const twitterUser: includedUserData = {
      twitterId: profile.id,
      username: profile.username,
      twitterToken: token,
      twitterSecret: secret,
      profileImage: profile.photos[0].value,
      //S3에 저장한 뒤 링크 생성할 것
    };
    let signedUser: User;
    let login: boolean = false;
    const existProfileUser = await this.authService.validateProfile(
      twitterUser.twitterToken,
    );
    if (existProfileUser) {
      console.log('이미 프로파일 존재');
      existProfileUser;
      login = true;
      signedUser = existProfileUser;
      this.authService.loginDateAdd(existProfileUser.profile); //로그인 기록
      //이미 사용자 존재하므로 존재하는 사용자로 로그인
    } else {
      const existUser = await this.authService.validateUser(
        twitterUser.twitterId,
      );
      if (existUser) {
        console.log('이미 사용자 존재 프로파일 생성');
        signedUser = await this.authService.createProfile(
          existUser.id,
          twitterUser,
        );
        //사용자만 존재하므로 프로필만 생성
      } else {
        console.log('완전히 새로운 사용자와 프로파일');
        signedUser = await this.authService.createUserandProfile(twitterUser);
        //사용자도 프로필도 없기 때문에 둘 다 생성
      }
    }
    if (!signedUser) throw new UnauthorizedException();
    return { ...signedUser, login };
  }
}
