import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
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
    {
      cascade: true,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  @Field(type => Taste, { nullable: true })
  toTaste?: Taste;

  @ManyToOne(
    type => Profile,
    profile => profile.takenReviews,
    {
      cascade: true,
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      nullable: true,
    },
  )
  @Field(type => Taste, { nullable: true })
  toProfile?: Taste;

  @ManyToOne(
    type => Profile,
    profile => profile.reviews,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @Field(type => Profile)
  author: Profile;

  @Column({ type: 'text' })
  @Field()
  text: string;

  @Column({ type: 'timestamp' })
  @Field()
  createAt: Date;
}
