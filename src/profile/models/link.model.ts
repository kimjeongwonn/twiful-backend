import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsUrl } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from './profile.model';

@Entity()
@ObjectType()
export class Link {
  @PrimaryGeneratedColumn()
  @Field(type => ID)
  id: number;

  @ManyToOne(
    type => Profile,
    profile => profile.links,
  )
  host: Profile;

  @IsUrl()
  @Column()
  @Field()
  linkUrl: string;
}
