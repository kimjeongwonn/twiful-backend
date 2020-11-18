import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { FindConditions, FindOneOptions, Repository } from 'typeorm';
import { Taste } from './models/taste.model';

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste) private tasteRepository: Repository<Taste>,
    private userService: UserService,
  ) {}

  async findOne(
    conditions?: FindConditions<Taste>,
    options?: FindOneOptions<Taste>,
  ): Promise<Taste> {
    return this.tasteRepository.findOne(conditions, options);
  }

  async likeTasteToggle(user, input: { id: number; name: string }) {} //작업필요
}
