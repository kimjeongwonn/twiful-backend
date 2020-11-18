import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
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

  @OneToMany(
    type => Review,
    review => review.author,
  )
  @Field(type => [Review])
  reviews: Review[];

  @OneToMany(
    type => Link,
    link => link.host,
  )
  @Field(type => [Link])
  links: Link[];

  @OneToOne(
    type => Recruit,
    recruit => recruit.host,
  )
  @Field(type => Recruit)
  recruit: Recruit;

  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;

  @Column({ type: 'timestamp' })
  lastLoginAt: Date;
}
