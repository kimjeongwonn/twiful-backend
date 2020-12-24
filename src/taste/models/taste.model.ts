import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Profile } from '../../profile/models/profile.model';
import { Review } from '../../review/models/review.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TasteRelation } from './tasteRelation.model';

@Entity()
@ObjectType()
export class Taste {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @Column({ unique: true })
  @Field()
  name: string;

  @OneToMany(
    type => TasteRelation,
    tasteRelation => tasteRelation.profile,
  )
  tasteToProfile: TasteRelation[];

  @OneToMany(
    type => Review,
    review => review.toTaste,
  )
  @Field(type => [Review])
  reviews: Review[];

  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;
}
