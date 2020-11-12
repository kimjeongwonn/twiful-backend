import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recruit } from './models/recruit.model';

@Injectable()
export class RecruitService {
  constructor(
    @InjectRepository(Recruit) recruitRepository: Repository<Recruit>,
  ) {}
}
