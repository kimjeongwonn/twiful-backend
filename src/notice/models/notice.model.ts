import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Profile } from '../../profile/models/profile.model';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Notice {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @ManyToOne(
    type => Profile,
    profile => profile.sendedNotice,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  from: Profile;

  @ManyToOne(
    type => Profile,
    profile => profile.receivedNotice,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  to: Profile;

  @Column()
  @Field()
  type: string;

  @Column()
  @Field()
  content: string;
}
