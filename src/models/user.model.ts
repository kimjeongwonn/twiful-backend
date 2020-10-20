import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Profile } from 'src/models/profile.model';

enum FriendRelation {
  FRIEND,
  SENT,
  RECEIVED,
}

registerEnumType(FriendRelation, {
  name: 'FriendRelation',
});

@ObjectType()
export class User {
  @Field(type => ID)
  id: string; //uuid

  @Field(type => Int, { description: 'twitter ID' })
  twitterId: number;

  // @Field()
  // joined: boolean;
  // FieldResolver

  @Field(type => Profile, { nullable: true })
  profile?: Profile;

  @Field(type => [User])
  friends: User[];

  // @Field()
  // friendsCount: number;
  // fieldResolver

  @Field(type => [User])
  friendRequest: User[];

  // @Field(type => [User])
  // overlappedFriends: User[];
  // fieldResolver

  @Field(type => [User])
  blocks: User[];

  // @Field()
  // isSelf: boolean;
  // fieldResolver

  // @Field(type => FriendRelation)
  // isFriend: FriendRelation;
  // fieldResolver

  @Field()
  createAt: Date;
}
