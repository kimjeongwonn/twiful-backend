import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Profile } from '../../profile/models/profile.model';
import { Taste } from '../../taste/models/taste.model';

@Entity()
@ObjectType()
@Unique(['author', 'toTaste'])
@Unique(['author', 'toProfile'])
export class Review {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @ManyToOne(
    type => Taste,
    taste => taste.reviews,
    { cascade: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
  )
  @Field(type => Taste)
  toTaste: Taste;

  @ManyToOne(
    type => Profile,
    profile => profile.takenReviews,
    { cascade: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
  )
  @Field(type => Taste)
  toProfile: Taste;

  @ManyToOne(
    type => Profile,
    profile => profile.reviews,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @Field(type => Profile)
  author: Profile;

  @Field()
  updatedAt: Date;
}
