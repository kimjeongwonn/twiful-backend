import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../../profile/models/profile.model';

@Entity()
@ObjectType()
export class Recruit {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @Column()
  @Field()
  published: boolean;

  @OneToOne(
    type => Profile,
    profile => profile.recruit,
    { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @JoinColumn()
  @Field(type => Profile)
  host: Profile;

  @Column()
  @Field()
  caption: string;

  @Column()
  @Field()
  fromDate: Date;

  @Column()
  @Field({ nullable: true })
  toDate?: Date;
}
