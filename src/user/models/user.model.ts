import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Notice } from '../../notice/models/notice.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../../profile/models/profile.model';
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
    friendRelation => friendRelation.friendReceiver,
  )
  friendReceives: FriendRelation[];

  @OneToMany(
    type => FriendRelation,
    friendRelation => friendRelation.friendRequester,
  )
  friendRequests: FriendRelation[];

  @Column({ default: true })
  @Field(type => Boolean)
  publicFriends: boolean;

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
