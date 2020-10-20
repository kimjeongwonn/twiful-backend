import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Profile } from './profile.model';
import { Category } from './category.model';
import { Comment } from './comment.model';

@ObjectType()
export class Taste {
  @Field(type => ID)
  id: string;

  @Field(type => Category)
  category: Category;

  @Field()
  name: string;

  @Field(type => [Taste])
  recommends: Taste[];

  @Field(type => [Profile])
  likers: Profile[];

  @Field(type => [Profile])
  dislikes: Profile[];

  @Field(type => [Comment])
  comments: Comment[];

  @Field()
  createAt: Date;
}
