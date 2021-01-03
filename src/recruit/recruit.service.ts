import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRelation } from 'src/user/models/friendRelation.model';
import {
  Connection,
  FindConditions,
  FindOneOptions,
  In,
  ObjectID,
  Repository,
} from 'typeorm';
import { Profile } from '../profile/models/profile.model';
import { TasteRelation } from '../taste/models/tasteRelation.model';
import { User } from '../user/models/user.model';
import { Candidate } from './models/canditate.model';
import { Recruit } from './models/recruit.model';
import { RecruitInput } from './recruit.resolver';

@Injectable()
export class RecruitService {
  constructor(
    @InjectRepository(FriendRelation)
    private friendRelationRepository: Repository<FriendRelation>,
    @InjectRepository(Recruit) private recruitRepository: Repository<Recruit>,
    @InjectRepository(TasteRelation)
    private tasteRelationRepository: Repository<TasteRelation>,
    private connection: Connection,
  ) {}

  findOne(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<Recruit>,
  ): Promise<Recruit | undefined>;
  findOne(options?: FindOneOptions<Recruit>): Promise<Recruit | undefined>;
  findOne(
    conditions?: FindConditions<Recruit>,
    options?: FindOneOptions<Recruit>,
  ): Promise<Recruit | undefined>;
  async findOne(...args) {
    return this.recruitRepository.findOne(...args);
  }

  async getRcruitToProfile(id: number) {
    const result = await this.recruitRepository.findOne(id, {
      select: ['id'],
      relations: ['host'],
    });
    return result.host;
  }

  async startRecruit(user: User, data: RecruitInput) {
    const profile = await user.getProfile();
    const update = await this.recruitRepository.update(
      { host: profile },
      {
        published: true,
        ...data,
      },
    );
    return !!update.affected;
  }

  async setTaste(
    user: User,
    tasteIds: { likeIds: number[]; dislikeIds: number[] },
  ) {
    if (tasteIds.dislikeIds.length + tasteIds.likeIds.length === 0)
      throw new Error('최소한 한가지는 선택해야 합니다.');
    if (tasteIds.likeIds.length > 10 || tasteIds.dislikeIds.length > 3)
      throw new Error(
        '좋아요는 10개, 싫어요는 3개 이하로 선택해 주셔야 합니다.',
      );
    const profile = await user.getProfile();
    await this.tasteRelationRepository.update(
      { profileId: profile.id, includeRecruit: true },
      { includeRecruit: false },
    );
    const tastes = await this.tasteRelationRepository.find({
      where: [
        {
          profileId: profile.id,
          tasteId: In(tasteIds.likeIds),
          status: 'like',
        },
        {
          profileId: profile.id,
          tasteId: In(tasteIds.dislikeIds),
          status: 'dislike',
        },
      ],
    });
    if (tastes.length !== tasteIds.likeIds.length + tasteIds.dislikeIds.length)
      throw new Error(
        `반환된 관계와 배열의 길이가 다릅니다. 반환된 배열의 길이 : ${tastes}`,
      );
    tastes.forEach(taste => {
      taste.includeRecruit = true;
    });
    return !!this.tasteRelationRepository.save(tastes);
  }

  async endRecruit(user: User) {
    const profile = await user.getProfile();
    const update = await this.recruitRepository.update(
      { host: profile },
      {
        published: false,
      },
    );
    const updateTasteRelation = await this.tasteRelationRepository.update(
      { profileId: profile.id, includeRecruit: true },
      { includeRecruit: false },
    );

    const relations = await this.friendRelationRepository.find({
      where: [
        { friendReceiverId: user.id, concluded: false },
        { friendRequesterId: user.id, concluded: false },
      ],
    });
    return (
      !!this.friendRelationRepository.remove(relations) &&
      updateTasteRelation.affected &&
      update.affected
    );
  }

  async validRecruit(profile: Profile) {
    const recruit = await this.recruitRepository.findOne({ host: profile });
    return (
      recruit.published &&
      (recruit.toDate > new Date() || recruit.toDate === null)
    );
  }

  async getRecommendedRecruits(user: User) {
    const profile = await user.getProfile();
    if (!(await this.validRecruit(profile)))
      throw new Error('트친소를 먼저 시작해야 합니다.');
    const myTastes = { likes: [], dislikes: [] };
    const myRelations = await this.tasteRelationRepository.find({
      where: { profileId: profile.id, includeRecruit: true },
    });
    if (!myRelations) throw new Error('반영할 취향이 없습니다');
    myRelations.forEach(taste => {
      if (taste.status === 'like') myTastes.likes.push(taste.tasteId);
      else if (taste.status === 'dislike')
        myTastes.dislikes.push(taste.tasteId);
    });
    //TODO: groupby로 카운트 하기
    const candidateList = await this.connection
      .createQueryBuilder()
      .select('profileId')
      .addSelect(
        'COUNT(IF(toStatus="like" AND fromStatus="like", tasteId, NULL))',
        'likeToLike',
      )
      .addSelect(
        'COUNT(IF(toStatus="like" AND fromStatus="dislike", tasteId, NULL))',
        'likeToDislike',
      )
      .addSelect(
        'COUNT(IF(toStatus="dislike" AND fromStatus="like", tasteId, NULL))',
        'dislikeToLike',
      )
      .addSelect(
        'COUNT(IF(toStatus="dislike" AND fromStatus="dislike", tasteId, NULL))',
        'dislikeToDislike',
      )
      .from(qb => {
        return qb
          .select('profileId')
          .addSelect('tasteId')
          .addSelect(
            'CASE WHEN tasteId IN (:...likeTasteIds) THEN "like" WHEN tasteId IN (:...dislikeTasteIds) THEN "dislike" ELSE NULL END',
            'toStatus',
          )
          .setParameter('likeTasteIds', myTastes.likes)
          .setParameter('dislikeTasteIds', myTastes.dislikes)
          .addSelect(
            'CASE WHEN status="like" THEN "like" WHEN status="dislike" THEN "dislike" ELSE NULL END',
            'fromStatus',
          )
          .from(TasteRelation, 'taste_relation')
          .where('NOT profileId = :profileId', { profileId: profile.id })
          .andWhere('includeRecruit = 1')
          .andWhere('tasteId IN (:...tasteIds)', {
            tasteIds: [...myTastes.likes, ...myTastes.dislikes],
          });
      }, 'taste_relation_table')
      .groupBy('profileId')
      .getRawMany<Candidate>();
    if (candidateList.length === 0) throw new Error('후보목록이 없습니다');
    return candidateList;
  }
}
