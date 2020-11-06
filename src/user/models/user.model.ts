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

  @Column({ unique: true, nullable: true })
  @Field({ description: 'twitter ID' })
  twitterId: string;

  @Column({ unique: true })
  @Field({ description: 'twitter API Token', nullable: true })
  twitterToken?: string;

  @Column({ unique: true })
  @Field({ nullable: true })
  twitterSecret?: string;

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
  createAt: Date;
}
