import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Profile } from './models/profile.model';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PROFILE_REPOSITORY') private userRepository: Repository<Profile>,
  ) {}
}
