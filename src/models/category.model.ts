import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Taste } from './taste.model';

@ObjectType()
export class Category {
  @Field(type => ID)
  id: string;

  @Field()
  name: string;

  @Field(type => [Taste])
  tastes: Taste[];
}
