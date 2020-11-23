import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StringUtil } from '../util/util.string';
import {
  Connection,
  FindConditions,
  FindOneOptions,
  ObjectID,
  Repository,
} from 'typeorm';
import { Profile } from '../profile/models/profile.model';
import { User } from '../user/models/user.model';
import { Taste } from './models/taste.model';
import { tasteMethod } from './taste.resolver';
import { Review } from '../review/models/review.model';

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste) private tasteRepository: Repository<Taste>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    private connection: Connection,
    private stringUtil: StringUtil,
  ) {}

  findOne(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<Taste>,
  ): Promise<Taste | undefined>;
  findOne(options?: FindOneOptions<Taste>): Promise<Taste | undefined>;
  findOne(
    conditions?: FindConditions<Taste>,
    options?: FindOneOptions<Taste>,
  ): Promise<Taste | undefined>;
  async findOne(...args): Promise<Taste> {
    return this.tasteRepository.findOne(...args);
  }

  async getTasteToLikersOrDislikers(
    taste: Taste,
    method: 'likes' | 'dislikes',
    count: boolean = false,
  ): Promise<Profile[] | number> {
    const options = {
      join: {
        alias: 'profile',
        innerJoinAndSelect: { [method]: `profile.${method}` },
      },
      where: qb => {
        qb.where(`${method}.id = :${method}Id`, {
          [`${method}Id`]: taste.id,
        });
      },
    };
    if (count) return this.profileRepository.count(options);
    return this.profileRepository.find(options);
  }

  async getTasteToReview(taste: Taste): Promise<Review[]> {
    return (
      await this.tasteRepository.findOne(taste.id, { relations: ['reviews'] })
    ).reviews;
  }

  async createTaste(input: { name: string; likers?: Profile[] }) {
    const newTaste = await this.tasteRepository.create(input);
    return this.tasteRepository.save(newTaste);
  }

  async addTaste(user: User, input: { name: string; method: tasteMethod }) {
    if (!this.stringUtil.testString(input.name))
      input.name = this.stringUtil.filteringString(input.name);
    const oppMethod =
      input.method === 'likers'
        ? 'dislikers'
        : input.method === 'dislikers'
        ? 'likers'
        : null;
    if (!input.method || !oppMethod) throw new Error('지정되지 않은 메소드');
    const profile = await user.getProfile();
    const existTaste = await this.tasteRepository.findOne(
      //입력한 name에 맞는 취향이 존재하는지 확인
      { name: input.name },
      {
        relations: [input.method],
      },
    );
    const existTasteRelation = await this.tasteRepository.findOne({
      //내가 취향과 관계되어 있나 확인
      join: {
        alias: 'taste',
        innerJoinAndSelect: { [input.method]: `taste.${input.method}` },
      },
      where: qb => {
        qb.where('taste.name = :tasteName', {
          tasteName: input.name,
        }).andWhere(`${input.method}.id = :likersId`, { likersId: profile.id });
      },
    });
    if (existTasteRelation) {
      //이미 관계되어 있는경우 -> 관계 삭제
      await this.connection
        .createQueryBuilder()
        .relation(Taste, input.method)
        .of(existTasteRelation)
        .remove(profile);
      return false;
    }

    const existOppTasteRelation = await this.tasteRepository.findOne({
      //반대 메소드로 관계되어있나 확인
      join: {
        alias: 'taste',
        innerJoinAndSelect: { [oppMethod]: `taste.${oppMethod}` },
      },
      where: qb => {
        qb.where('taste.name = :tasteName', {
          tasteName: input.name,
        }).andWhere(`${oppMethod}.id = :likersId`, { likersId: profile.id });
      },
    });
    if (existOppTasteRelation) {
      console.log('반대메소드');
      //반대 메소드로 관계된 취향 -> 삭제 후 진행
      await this.tasteRepository
        .createQueryBuilder()
        .relation(oppMethod)
        .of(existOppTasteRelation)
        .remove(profile);
    }
    if (existTaste) {
      //이미 존재하는 취향 -> 지정한 메소드로 관계
      console.log('존재하는취향');
      existTaste[input.method].push(await user.getProfile());
      await this.tasteRepository.save(existTaste);
      return true;
    } else {
      //새로운 취향 -> 취향 생성 후 지정한 메소드로 관계
      console.log('새로운취향');
      const newTaste = await this.createTaste({
        name: input.name,
        [input.method]: [await user.getProfile()],
      });
      await this.tasteRepository.save(newTaste);
      return true;
    }
  }
}
