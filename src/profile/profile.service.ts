import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, FindOneOptions, ObjectID, Repository } from 'typeorm';
import { RecruitService } from '../recruit/recruit.service';
import { Review } from '../review/models/review.model';
import { TasteRelation } from '../taste/models/tasteRelation.model';
import { User } from '../user/models/user.model';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Link) private linkRepository: Repository<Link>,
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
    @InjectRepository(TasteRelation)
    private tasteRelationRepository: Repository<TasteRelation>,
    private recruitService: RecruitService,
  ) {}

  findOne(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<Profile>,
  ): Promise<Profile | undefined>;
  findOne(options?: FindOneOptions<Profile>): Promise<Profile | undefined>;
  findOne(
    conditions?: FindConditions<Profile>,
    options?: FindOneOptions<Profile>,
  ): Promise<Profile | undefined>;
  findOne(...args): Promise<Profile | undefined> {
    return this.profileRepository.findOne(...args);
  }

  async getProfileToUser(profile: Profile) {
    const currentProfile = await this.findOne(profile.id, {
      select: ['id'],
      relations: ['user'],
    });
    return currentProfile.user;
  }

  async getProfileToRecruit(profile: Profile) {
    return this.recruitService.findOne({ host: profile });
  }
  async getProfileToLink(profile: Profile) {
    return this.linkRepository.find({
      where: { host: { profile } },
    });
  }

  async getProfileToLikesOrDislikes(
    profile: Profile,
    method: 'like' | 'dislike',
    count: boolean = false,
    user?: User,
  ) {
    if (
      method === 'dislike' &&
      !profile.publicDislikes &&
      (await user?.getProfile()).id !== profile.id
    )
      throw new Error('싫어요 비공개');
    const options = {
      where: { profile, status: method },
      relations: ['taste'],
    };
    if (count) return this.profileRepository.count(options);
    return (await this.tasteRelationRepository.find(options)).map(
      relation => relation.taste,
    );
  }

  async getProfileToReviews(
    profile: Profile,
    method: 'toProfile' | 'author',
    count: boolean = false,
  ) {
    const options = {
      join: {
        alias: 'review',
        innerJoinAndSelect: { [method]: `review.${method}` },
      },
      where: qb => {
        qb.where(`${method}.id = :${method}Id`, {
          [`${method}Id`]: profile.id,
        });
      },
    };
    if (count) return this.reviewRepository.count(options);
    return this.reviewRepository.find(options);
  }

  async togglePublicDislikes(user: User) {
    const current = (
      await this.profileRepository.findOne(
        { user: { id: user.id } },
        {
          select: ['publicDislikes'],
        },
      )
    ).publicDislikes;
    this.profileRepository.update(
      { user: { id: user.id } },
      {
        publicDislikes: !current,
      },
    );
    return !current;
  }

  async editProfile(user: User, input: { bio: string }) {
    const result = await this.profileRepository.update(
      await user.getProfile(),
      input,
    );
    if (result.affected) return input.bio;
    else return;
  }

  async addLink(user: User, input: { url: string; type: string }) {
    const newLink = this.linkRepository.create({
      host: await user.getProfile(),
      ...input,
    });
    return this.linkRepository.save(newLink);
  }

  async editLink(user: User, input: { url?: string; type?: string }) {
    if (Object.keys(input).length === 0)
      throw new Error('최소한 하나는 수정해야 합니다');
    const result = await this.linkRepository.update(
      { host: await user.getProfile() },
      input,
    );
    return !!result.affected;
  }

  async deleteLink(user: User, id: number) {
    const willDeleteLink = await this.linkRepository.findOne({
      host: user,
      id,
    });
    if (!willDeleteLink)
      throw new Error('내가 소유한 해당 링크객체를 찾을 수 없습니다.');
    return !!(await this.linkRepository.remove(willDeleteLink));
  }
}
