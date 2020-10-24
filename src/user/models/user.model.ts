import { Field, ID, Int, ObjectType, Parent } from '@nestjs/graphql';
import { Profile } from 'src/profile/models/profile.model';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { MaxLength } from 'class-validator';
import { UserService } from '../user.service';
import { FriendRelation } from './friendRelation.model';

@Entity()
@ObjectType()
export class User {
  constructor(private readonly userService: UserService) {}

  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @MaxLength(12)
  @Column('varchar', { length: 12, unique: true })
  @Field()
  username: string;

  @Column({ unique: true })
  @Field(type => Int, { description: 'twitter ID' })
  twitterId: number;

  @OneToOne(
    type => Profile,
    profile => profile.user,
  )
  @Field(type => Profile, { nullable: true })
  profile?: Profile;

  @OneToMany(
    type => FriendRelation,
    friendRelation => friendRelation.friendReciver,
  )
  friendRecives: FriendRelation[];

  @OneToMany(
    type => FriendRelation,
    friendRelation => friendRelation.friendRequester,
  )
  friendRequests: FriendRelation[];

  @Field(type => [User]) //FR
  friends: User[];

  @Field(type => ID)
  async friendsCount(@Parent() root: User): Promise<number> {
    const result = await this.userService.findAll();
    return result[0].id;
  }

  @Field(type => [User]) //FR
  overlappedFriends: User[];

  @ManyToMany(
    type => User,
    user => user.beBlocked,
  )
  @JoinColumn()
  @Field(type => [User])
  blocked: User[];

  @ManyToMany(
    type => User,
    user => user.blocked,
  )
  beBlocked: User[];

  @Field() //FR
  isSelf: boolean;

  @Field() //FR
  isFriend: boolean;

  @CreateDateColumn()
  createAt: Date;

  @Column()
  lastLoginAt: Date;
}
