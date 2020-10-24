import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from '../../profile/models/profile.model';
import { Taste } from '../../taste/models/taste.model';

@Entity()
@ObjectType()
export class Review {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @ManyToOne(
    type => Taste,
    taste => taste.reviews,
  )
  @Field(type => Taste)
  taste: Taste;

  @ManyToOne(
    type => Profile,
    profile => profile.reviews,
  )
  @Field(type => Profile)
  author: Profile;

  @Field()
  updatedAt: Date;
}