import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Notice } from '../../notice/models/notice.model';
import { Recruit } from '../../recruit/models/recruit.model';
import { Review } from '../../review/models/review.model';
import { Taste } from '../../taste/models/taste.model';
import { User } from '../../user/models/user.model';
import { Link } from './link.model';

@Entity()
@ObjectType()
export class Profile {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @OneToOne(
    type => User,
    user => user.profile,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @JoinColumn()
  user: User;

  @IsEmail()
  @Column({ unique: true, nullable: true })
  @Field()
  email?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  profileImage?: string;

  @ManyToMany(
    type => Taste,
    taste => taste.likers,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @JoinTable()
  @Field(type => [Taste])
  likes: Taste[];

  @ManyToMany(
    type => Taste,
    taste => taste.dislikers,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @JoinTable()
  @Field(type => [Taste])
  dislikes: Taste[];

  @Column({ default: false })
  @Field()
  publicDislikes: boolean; //싫어요 공개여부

  @OneToMany(
    type => Review,
    review => review.author,
  )
  @Field(type => [Review])
  reviews: Review[];

  @Column({ default: false })
  @Field()
  publicReviews: boolean; //작성한 리뷰 공개여부

  @OneToMany(
    type => Review,
    review => review.toProfile,
  )
  @Field(type => [Review])
  takenReviews: Review[];

  @OneToMany(
    type => Link,
    link => link.host,
  )
  @Field(type => [Link])
  links: Link[];

  @OneToOne(
    type => Recruit,
    recruit => recruit.host,
    { cascade: true },
  )
  @Field(type => Recruit)
  recruit: Recruit;

  @OneToMany(
    type => Notice,
    notice => notice.from,
  )
  @Field(type => [Notice])
  sendedNotice: Notice[];

  @OneToMany(
    type => Notice,
    notice => notice.to,
  )
  @Field(type => [Notice])
  receivedNotice: Notice[];

  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;

  @Column({ type: 'timestamp' })
  lastLoginAt: Date;
}
