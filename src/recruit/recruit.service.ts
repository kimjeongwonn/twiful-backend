import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Recruit } from './models/recruit.model';

@Injectable()
export class RecruitService {
  constructor(
    @Inject('RECRUIT_REPOSITORY') private userRepository: Repository<Recruit>,
  ) {}
}
