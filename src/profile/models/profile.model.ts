import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import { Review } from 'src/review/models/review.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Recruit } from '../../recruit/models/recruit.model';
import { Taste } from '../../taste/models/taste.model';
import { User } from '../../user/models/user.model';

@Entity()
@ObjectType()
export class Profile {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @OneToOne(
    type => User,
    user => user.profile,
  )
  @JoinColumn()
  @Field(type => User)
  user: User;

  @IsEmail()
  @Column()
  @Field()
  email: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  profileImage?: string;

  @OneToMany(
    type => Taste,
    taste => taste.likers,
  )
  @Field(type => [Taste])
  likes: Taste[];

  @OneToMany(
    type => Taste,
    taste => taste.dislikers,
  )
  @Field(type => [Taste])
  dislikes: Taste[];

  @OneToMany(
    type => Review,
    review => review.author,
  )
  @Field(type => [Review])
  reviews: Review[];

  @OneToOne(
    type => Recruit,
    recruit => recruit.published,
  )
  @Field(type => Recruit)
  recruit: Recruit;

  @CreateDateColumn()
  createAt: Date;
}
