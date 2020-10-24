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
  id: number; //uuid

  @ManyToOne(
    type => User,
    user => user.friendRequests,
  )
  friendRequester: User;

  @ManyToOne(
    type => User,
    user => user.friendRecives,
  )
  friendReciver: User;

  @Column()
  concluded: boolean;

  @CreateDateColumn()
  createAt: Date;

  @Column()
  concludedAt: Date;
}
