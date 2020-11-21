import { Field, ID, Int, ObjectType, Parent } from '@nestjs/graphql';
import { Profile } from '../../profile/models/profile.model';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { FriendRelation } from './friendRelation.model';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @Column('varchar', { unique: true })
  @Field()
  username: string;

  @Column({ default: false })
  publicTwitterUsername: boolean;

  @Column({ unique: true })
  @Field()
  twitterId: string;

  @Column({ unique: true, nullable: true })
  twitterToken?: string;

  @Column({ unique: true, nullable: true })
  twitterSecret?: string;

  @OneToOne(
    type => Profile,
    profile => profile.user,
  )
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

  @Column({ default: true })
  @Field(type => Boolean)
  publicFriends: boolean;

  @ManyToMany(
    type => User,
    user => user.beBlocked,
    { cascade: true },
  )
  @JoinTable()
  @Field(type => [User])
  blocked: User[];

  @ManyToMany(
    type => User,
    user => user.blocked,
  )
  beBlocked: User[];

  @CreateDateColumn({ type: 'timestamp' })
  @Field(type => Date)
  createAt: Date;

  getProfile: () => Promise<Profile>;
}
