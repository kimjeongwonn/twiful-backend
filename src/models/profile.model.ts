import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Recruit } from './recruit.model';
import { Taste } from './taste.model';
import { User } from './user.model';

@ObjectType()
export class Profile {
  @Field(type => ID)
  id: string; //uuid

  @Field(type => User)
  user: User;

  @Field()
  userName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  profileImage?: string;

  @Field(type => [Taste])
  likes: Taste[];

  @Field(type => [Taste])
  dislikes: Taste[];

  @Field(type => Recruit)
  recruit: Recruit;

  @Field()
  createAt: Date;
}
