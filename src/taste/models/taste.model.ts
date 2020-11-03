import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Profile } from '../../profile/models/profile.model';
import { Category } from './category.model';
import { Review } from '../../review/models/review.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Taste {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @ManyToOne(
    type => Category,
    category => category.tastes,
    { cascade: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
  )
  @Field(type => Category)
  category: Category;

  @Column()
  @Field()
  name: string;

  @ManyToMany(
    type => Profile,
    profile => profile.likes,
  )
  @Field(type => [Profile])
  likers: Profile[];

  @ManyToMany(
    type => Profile,
    profile => profile.dislikes,
  )
  @Field(type => [Profile])
  dislikers: Profile[];

  @OneToMany(
    type => Review,
    review => review.taste,
  )
  @Field(type => [Review])
  reviews: Review[];

  @CreateDateColumn()
  createAt: Date;
}
