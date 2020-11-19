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

  @Column({ default: false })
  @Field()
  published: boolean;

  @OneToOne(
    type => Profile,
    profile => profile.recruit,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @JoinColumn()
  @Field(type => Profile)
  host: Profile;

  @Column({ nullable: true })
  @Field({ nullable: true })
  caption?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  toDate?: Date;
}
