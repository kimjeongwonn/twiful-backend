import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Profile } from './profile.model';
import { Taste } from './taste.model';

@ObjectType()
export class Comment {
  @Field(type => ID)
  id: string;

  @Field(type => Taste)
  taste: Taste;

  @Field(type => Profile)
  author: Profile;

  @Field()
  updatedAt: Date;
}
