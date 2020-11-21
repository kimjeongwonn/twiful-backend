import { Injectable } from '@nestjs/common';
import { User } from '../user/models/user.model';
import { ArrayUtil } from '../util/util.array';
import * as Twitter from 'twitter';
import { followersList, TwitterUserDto } from './twitter.interface';

@Injectable()
export class TwitterService {
  constructor(private readonly array: ArrayUtil) {}
  private _client: Twitter;

  //트위터 API 초기화
  private setTwitter({ twitterToken, twitterSecret }: User) {
    this._client = new Twitter({
      consumer_key: process.env.TWITTER_API_KEY,
      consumer_secret: process.env.TWITTER_API_SECRET,
      access_token_key: twitterToken,
      access_token_secret: twitterSecret,
    });
  }

  //팔로워ID 가져오기
  private async getFollower(user: User, cursor?: string) {
    const param = cursor
      ? { user_id: user.twitterId, cursor, stringify_ids: true }
      : { user_id: user.twitterId, stringify_ids: true };
    const result = await this._client.get('/followers/ids', param);
    return result;
  }

  //TwitterUserName 가져오기
  private async getUserName(twitterId: string): Promise<string> {
    const account = (await this._client.get('users/show', {
      user_id: twitterId,
    })) as TwitterUserDto;
    return account.screen_name;
  }

  //모든 팔로워ID 가져오기 재귀함수 **테스트 필요**
  private async getFullFollowers(user: User, corsur?: string) {
    const tempList = (await this.getFollower(user, corsur)) as followersList;
    if (tempList.next_cursor)
      tempList.ids.push(
        ...(await this.getFullFollowers(user, tempList.next_cursor_str)),
      );
    return tempList.ids;
  }

  //팔로잉ID 가져오기
  private async getFollowing(user: User, cursor?: string) {
    const param = cursor
      ? { user_id: user.twitterId, cursor, stringify_ids: true }
      : { user_id: user.twitterId, stringify_ids: true };
    const result = await this._client.get('/friends/ids', param);
    return result;
  }

  //모든 팔로잉ID 가져오기 재귀함수 **테스트 필요**
  private async getFullFollowings(user: User, corsur?: string) {
    const tempList = (await this.getFollowing(user, corsur)) as followersList;
    if (tempList.next_cursor)
      tempList.ids.push(
        ...(await this.getFullFollowings(user, tempList.next_cursor_str)),
      );
    return tempList.ids;
  }

  //실제 실행로직

  //유저 팔로우하기
  async followUser(user: User, targetUserTwitterId: string) {
    this.setTwitter(user);
    return this._client.post('/friendships/create', {
      user_id: targetUserTwitterId,
    });
  }

  //유저 언팔로우
  async unfollowUser(user: User, targetUserTwitterId: string) {
    this.setTwitter(user);
    return this._client.post('/friendships/destroy', {
      user_id: targetUserTwitterId,
    });
  }

  //맞팔유저 가져오기 **테스트 필요**
  async getTwitterFriends(user: User) {
    this.setTwitter(user);
    const followers = await this.getFullFollowers(user);
    const followings = await this.getFullFollowings(user);
    const shorten =
      followers.length > followings.length ? followings : followers;
    const longest =
      followers.length > followings.length ? followers : followings;

    const { inter } = this.array.getArraySet(shorten, longest);
    const result: TwitterUserDto[] = [];

    do {
      const splitArray = inter.splice(0, 100);
      const splitResult = (await this._client.get('/users/lookup', {
        user_id: splitArray.join(','),
      })) as TwitterUserDto[];
      result.push(...splitResult);
    } while (inter.length >= 100);
    //100명 이상이면 분할하여 GET요청 **테스트 필요**

    return result;
  }

  async getTwitterUrl(user: User, targetTwitterId: string) {
    this.setTwitter(user);
    return `https://twitter.com/${await this.getUserName(targetTwitterId)}`;
  }

  async relationCheck(
    user: User,
    targetTwitterId: string,
  ): Promise<'blocked' | 'clear' | 'protected' | 'follwing'> {
    this.setTwitter(user);
    const account = (await this._client.get('users/show', {
      user_id: targetTwitterId,
    })) as TwitterUserDto;
    if (account.protected) {
      if (account.status) return 'follwing';
      else return 'protected';
    } else {
      if (account.status) return 'clear';
      else return 'blocked';
    }
  }
}
