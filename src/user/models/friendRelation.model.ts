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

  @Column({ default: false })
  concluded: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  concludedAt?: Date;
}
