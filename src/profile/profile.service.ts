import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/models/user.model';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Link) private linkRepository: Repository<Link>,
    private userService: UserService,
  ) {}
  async findOneProfile(user: User) {
    return this.profileRepository.findOne(user);
  }

  async getProfileToUser(id) {
    const currentProfile = await this.profileRepository.findOne(id, {
      select: ['id'],
      relations: ['user'],
    });
    return currentProfile.user;
  }

  async editProfile(user: User, bio: string = '') {
    const profile = await this.findOneProfile(user);
    const result = await this.profileRepository.update(profile.id, { bio });
    if (result.affected) return bio;
    else return;
  }

  async addLink(user: User, url: string, type: string) {
    const profile = await this.findOneProfile(user);
    const newLink = this.linkRepository.create({
      host: profile,
      url,
      type,
    });
    return this.linkRepository.save(newLink);
  }
  async editLink(user: User, url?: string, type?: string) {
    if (!(url || type)) throw new Error('최소한 하나는 수정해야 합니다');
    const update: Partial<Link> = {};
    if (url) update.url = url;
    if (type) update.type = type;
    const profile = await this.findOneProfile(user);
    const result = await this.linkRepository.update({ host: profile }, update);
    return !!result.affected;
  }
}
