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
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  friendRequester: User;

  @ManyToOne(
    type => User,
    user => user.friendRecives,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  friendReciver: User;

  @Column()
  concluded: boolean;

  @CreateDateColumn()
  createAt: Date;

  @Column()
  concludedAt: Date;
}
