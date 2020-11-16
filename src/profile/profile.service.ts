import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Link) private linkRepository: Repository<Link>,
  ) {}

  async getProfileToUser(id) {
    const currentProfile = await this.profileRepository.findOne(id, {
      select: ['id'],
      relations: ['user'],
    });
    return currentProfile.user;
  }
}
