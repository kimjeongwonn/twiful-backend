import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, FindOneOptions, Repository } from 'typeorm';
import { Recruit } from './models/recruit.model';

@Injectable()
export class RecruitService {
  constructor(
    @InjectRepository(Recruit) private recruitRepository: Repository<Recruit>,
  ) {}

  async findOne(
    conditions?: FindConditions<Recruit>,
    options?: FindOneOptions<Recruit>,
  ) {
    return this.recruitRepository.findOne(conditions, options);
  }
}
