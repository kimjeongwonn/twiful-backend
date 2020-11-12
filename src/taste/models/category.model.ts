import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Taste } from './taste.model';

@Entity()
@ObjectType()
export class Category {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @OneToMany(
    type => Taste,
    taste => taste.category,
  )
  @Field(type => [Taste])
  tastes: Taste[];
}
