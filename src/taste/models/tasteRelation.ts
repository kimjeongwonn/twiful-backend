import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Profile } from '../../profile/models/profile.model';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
@ObjectType()
export class tasteRelataion {
  @PrimaryColumn()
  @Field(type => ID)
  profile: Profile;
}
