import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecruitService } from 'src/recruit/recruit.service';
import { User } from 'src/user/models/user.model';
import { FindConditions, FindOneOptions, ObjectID, Repository } from 'typeorm';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Link) private linkRepository: Repository<Link>,
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
    const currentProfile = await this.findOne(profile, {
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

  async getProfileToLikes(profile: Profile) {
    return (
      await this.profileRepository.findOne(profile, { relations: ['likes'] })
    ).likes;
  }
  async getProfileToDislikes(profile: Profile) {
    return (
      await this.profileRepository.findOne(profile, { relations: ['likes'] })
    ).dislikes;
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
