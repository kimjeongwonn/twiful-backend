import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../profile/models/profile.model';
import { FindConditions, FindOneOptions, ObjectID, Repository } from 'typeorm';
import { Recruit } from './models/recruit.model';
import { User } from 'src/user/models/user.model';
import { RecruitInput } from './recruit.resolver';

@Injectable()
export class RecruitService {
  constructor(
    @InjectRepository(Recruit) private recruitRepository: Repository<Recruit>,
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
}
