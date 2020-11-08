import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as Twitter } from 'passport-twitter';
import { TwitterService } from 'src/twitter/twitter.service';
import { User } from 'src/user/models/user.model';
import { AuthService } from './auth.service';

export interface includedUserData extends Partial<User> {
  profileImage: string;
}

@Injectable()
export class TwitterStrategy extends PassportStrategy(Twitter) {
  constructor(
    private readonly authService: AuthService,
    private twitterService: TwitterService,
  ) {
    super({
      consumerKey: process.env.TWITTER_API_KEY,
      consumerSecret: process.env.TWITTER_API_SECRET,
      callbackURL: process.env.TWITTER_API_CALLBACK,
      forceLogin: true,
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
    const existProfileUser = await this.authService.validateProfile(
      twitterUser.twitterToken,
    );
    if (existProfileUser) {
      console.log('이미 프로파일 존재');
      signedUser = existProfileUser;
      //이미 사용자 존재
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
    return signedUser;
  }
}
