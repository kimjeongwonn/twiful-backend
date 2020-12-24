import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../profile/models/profile.model';
import {
  Connection,
  FindConditions,
  FindOneOptions,
  In,
  ObjectID,
  Repository,
} from 'typeorm';
import { Recruit } from './models/recruit.model';
import { User } from '../user/models/user.model';
import { RecruitInput } from './recruit.resolver';
import { TasteRelation } from 'src/taste/models/tasteRelation.model';

interface candidateRawI {
  profileId: number;
  likes: number;
  dislikes: number;
}

interface candidateSetI {
  profileId: number;
  score: number;
}

@Injectable()
export class RecruitService {
  constructor(
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
    if (tasteIds.likeIds.length > 10 || tasteIds.dislikeIds.length > 10)
      throw new Error('선택은 각 10개 이하로 해야합니다.');
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
    return !!update.affected;
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
      .select('*')
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
          .where('tasteId IN (:...tasteIds)', {
            tasteIds: [...myTastes.likes, ...myTastes.dislikes],
          })
          .andWhere('NOT profileId = :profileId', { profileId: profile.id })
          .andWhere('includeRecruit = 1');
      }, 'taste_relation_table')
      .getRawMany();

    console.log(candidateList);

    // const candidateOnLikeBase = await this.tasteRelationRepository
    //   .createQueryBuilder('taste_relation')
    //   .select(`profileId`)
    //   .addSelect(`COUNT(IF(status='like',tasteId,null))`, 'likes') //겹치는 like
    //   .addSelect(`COUNT(IF(status='dislike',tasteId,null))`, `dislikes`) //내가 like했지만 상대는 dislike
    //   .where('taste_relation.tasteId IN (:...tasteIds)', {
    //     tasteIds: myTastes.likes,
    //   })
    //   .andWhere('NOT profileId = :profileId', { profileId: profile.id })
    //   .groupBy('profileId')
    //   .getRawMany<candidateRawI>();
    // const candidateOnDislikeBase = await this.tasteRelationRepository
    //   .createQueryBuilder('taste_relation')
    //   .select(`profileId`)
    //   .addSelect(`COUNT(IF(status='like',tasteId,null)) AS likes`) //내가 dislike했지만 상대는 like
    //   .addSelect(`COUNT(IF(status='dislike',tasteId,null)) AS dislikes`) //겹치는 dislike
    //   .where('taste_relation.tasteId IN (:...tasteIds)', {
    //     tasteIds: myTastes.dislikes,
    //   })
    //   .andWhere('NOT profileId = :profileId ', { profileId: profile.id })
    //   .groupBy('profileId')
    //   .getRawMany<candidateRawI>();
    // console.log(candidateOnLikeBase, candidateOnDislikeBase);

    // //TODO: 후보목록 가져오기 (좋아요 1개 이상 겹치는 사람)
    // if (candidateRelations.length === 0)
    //   throw new Error('조건에 해당하는 트친소가 없습니다..ㅠㅠ');
    // const candidateSet: candidateSetI[] = [];
    // candidateRelations.forEach((relation, idx) => {
    //   const candidateIdx = candidateSet.findIndex(
    //     x => x.profileId === relation.profileId,
    //   );
    // });
  }
}
