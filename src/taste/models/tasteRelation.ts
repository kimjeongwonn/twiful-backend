import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../../profile/models/profile.model';
import { Taste } from './taste.model';

@Entity()
@ObjectType()
export class TasteRelation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => Profile,
    profile => profile.profileToTaste,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @Field(type => Profile)
  profile: Profile;

  @ManyToOne(
    type => Taste,
    taste => taste.tasteToProfile,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @Field(type => Taste)
  taste: Taste;

  @Column()
  @Field()
  status: string;

  @Column({ default: false })
  @Field()
  includeRecruit: boolean;
}
