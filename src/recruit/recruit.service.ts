import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../profile/models/profile.model';
import { FindConditions, FindOneOptions, Repository } from 'typeorm';
import { Recruit } from './models/recruit.model';

@Injectable()
export class RecruitService {
  constructor(
    @InjectRepository(Recruit) private recruitRepository: Repository<Recruit>,
  ) {}

  async getRcruitToProfile(id: number) {
    const result = await this.recruitRepository.findOne(id, {
      select: ['id'],
      relations: ['host'],
    });
    return result.host;
  }

  async findOne(
    conditions?: FindConditions<Recruit>,
    options?: FindOneOptions<Recruit>,
  ) {
    return this.recruitRepository.findOne(conditions, options);
  }

  async validRecruit(profile: Profile) {
    const recruit = await this.recruitRepository.findOne({ host: profile });
    return recruit.published && recruit.toDate > new Date();
  }
}
