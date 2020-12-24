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
import { TasteRelation } from './models/tasteRelation.model';

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste) private tasteRepository: Repository<Taste>,
    @InjectRepository(TasteRelation)
    private tasteRelationRepository: Repository<TasteRelation>,
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
    method: 'like' | 'dislike',
    count: boolean = false,
  ): Promise<Profile[] | number> {
    const options = {
      where: { taste, status: method },
      relations: ['profile'],
    };
    if (count) return this.profileRepository.count(options);
    return (await this.tasteRelationRepository.find(options)).map(
      relation => relation.profile,
    );
  }

  async getTasteToReview(taste: Taste): Promise<Review[]> {
    return (
      await this.tasteRepository.findOne(taste.id, { relations: ['reviews'] })
    ).reviews;
  }

  async isRelation(user: User, taste: Taste) {
    const profile = await user.getProfile();
    const result = await this.tasteRelationRepository.findOne({
      where: { profile, taste },
    });
    return result.status;
  }

  async createTaste(name: string) {
    const newTaste = await this.tasteRepository.create({ name });
    return this.tasteRepository.save(newTaste);
  }

  async toggleTaste(
    user: User,
    input: { name?: string; id?: number; method: tasteMethod },
  ) {
    if (!this.stringUtil.testString(input.name))
      input.name = this.stringUtil.filteringString(input.name);
    if (input.name === '' && !input.id) throw new Error('입력값이 없습니다!');
    const oppMethod = input.method === 'dislike' ? 'like' : 'dislike';
    const profile = await user.getProfile();
    const tasteFindOption = input.id ? { id: input.id } : { name: input.name };
    const existTaste =
      (await this.tasteRepository.findOne(tasteFindOption)) ||
      (await this.createTaste(input?.name)); //입력한 name에 맞는 취향이 존재하는지 확인 없다면 생성
    const existTasteRelation = await this.tasteRelationRepository.findOne({
      where: { taste: existTaste, profile },
    }); //이미 좋아요or싫어요한 취향있는지 확인
    if (existTasteRelation) {
      if (existTasteRelation.includeRecruit)
        throw new Error('트친소에 적용중인 취향은 변경할 수 없습니다!');
      if (existTasteRelation.status === input.method) {
        const result = await this.tasteRelationRepository.remove(
          existTasteRelation,
        );
        if (result) return false;
        else throw new Error('존재하는 취향 삭제 실패');
      } else if (existTasteRelation.status === oppMethod) {
        //반대 메소드라면 상태 변경
        const result = await this.tasteRelationRepository.update(
          existTasteRelation,
          { status: input.method },
        );
        return !!result.affected;
      }
    } else {
      const newRelation = await this.tasteRelationRepository.create({
        profile,
        taste: existTaste,
        status: input.method,
      });

      return !!this.tasteRelationRepository.save(newRelation);
    }
  }
}
