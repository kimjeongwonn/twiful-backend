import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.model';

@Entity()
export class FriendRelation {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @ManyToOne(
    type => User,
    user => user.friendRequests,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  friendRequester: User;

  @Column()
  friendRequesterId: number;

  @ManyToOne(
    type => User,
    user => user.friendRecives,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  friendReciver: User;

  @Column()
  friendReciverId: number;

  @Column({ nullable: true })
  message?: string;

  @Column({ default: false })
  concluded: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  concludedAt?: Date;
}

@ObjectType()
export class FriendStatus {
  @Field({ nullable: true })
  message?: string;

  @Field()
  status: string;
}
