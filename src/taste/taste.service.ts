import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Taste } from './models/taste.model';

@Injectable()
export class TasteService {
  constructor(
    @Inject('TASTE_REPOSITORY') private userRepository: Repository<Taste>,
  ) {}
}
