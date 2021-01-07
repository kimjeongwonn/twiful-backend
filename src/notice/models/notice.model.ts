import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Profile } from '../../profile/models/profile.model';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/user/models/user.model';

@Entity()
@ObjectType()
export class Notice {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @ManyToOne(
    type => User,
    user => user.sendedNotice,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  from: User;

  @ManyToOne(
    type => User,
    user => user.receivedNotice,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  to: User;

  @Column()
  @Field()
  type: string;

  @Column({ default: false })
  @Field()
  confirm: boolean;
}
