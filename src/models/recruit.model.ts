import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Profile } from './profile.model';
import { User } from './user.model';

@ObjectType()
export class Recruit {
  @Field(type => ID)
  id: string;

  @Field()
  published: boolean;

  @Field(type => Profile)
  host: Profile;

  @Field(type => [User])
  requesters: User[];

  @Field(type => [User])
  matches: User[];

  @Field()
  caption: string;

  @Field()
  fromDate: Date;

  @Field({ nullable: true })
  toDate: Date;
}
