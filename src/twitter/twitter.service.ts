import { Injectable } from '@nestjs/common';
import { User } from 'src/user/models/user.model';
import * as Twitter from 'twitter';

@Injectable()
export class TwitterService {
  private _client: Twitter;

  private setTwitter({ twitterToken, twitterSecret }: User) {
    this._client = new Twitter({
      consumer_key: process.env.TWITTER_API_KEY,
      consumer_secret: process.env.TWITTER_API_SECRET,
      access_token_key: twitterToken,
      access_token_secret: twitterSecret,
    });
  }

  followUser(user: User, targetUser: User) {
    this.setTwitter(user);
    return this._client.post('/friendships/create', {
      user_id: targetUser.twitterId,
    });
  }
}
