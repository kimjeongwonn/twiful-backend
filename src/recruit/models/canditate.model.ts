import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Candidate {
  @Field()
  profileId: number;
  @Field()
  likeToLike: number;
  @Field()
  likeToDislike: number;
  @Field()
  dislikeToLike: number;
  @Field()
  dislikeToDislike: number;
}
