import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) profileRepository: Repository<Profile>,
    @InjectRepository(Link) linkRepository: Repository<Link>,
  ) {}
}
