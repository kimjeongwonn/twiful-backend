import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, FindOneOptions, ObjectID, Repository } from 'typeorm';
import { Taste } from './models/taste.model';
import { ProfileService } from '../profile/profile.service';
import { User } from '../user/models/user.model';
import { Profile } from '../profile/models/profile.model';

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste) private tasteRepository: Repository<Taste>,
    private profileService: ProfileService,
  ) {}

  findOne(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<Taste>,
  ): Promise<Taste | undefined>;
  findOne(options?: FindOneOptions<Taste>): Promise<Taste | undefined>;
  findOne(
    conditions?: FindConditions<Taste>,
    options?: FindOneOptions<Taste>,
  ): Promise<Taste | undefined>;
  async findOne(...args): Promise<Taste> {
    return this.tasteRepository.findOne(...args);
  }

  async getTasteToLikers(taste: Taste) {
    return (
      await this.tasteRepository.findOne(taste, { relations: ['likers'] })
    ).likers;
  }

  async getTasteToDislikers(taste: Taste) {
    return (
      await this.tasteRepository.findOne(taste, { relations: ['dislikers'] })
    ).dislikers;
  }

  async createTaste(input: { name: string; likers?: Profile[] }) {
    const newTaste = await this.tasteRepository.create(input);
    return this.tasteRepository.save(newTaste);
  }

  //TODO: 테스트 필요(싫어요 상태일때 예외처리? 싫어요 삭제 후 좋아요?)
  async likeTasteToggle(user: User, input: { name: string }) {
    const profile = await user.getProfile();
    const existTaste = await this.tasteRepository.findOne(input);
    const existLike = await this.tasteRepository.findOne({
      where: { name: input.name, likers: profile },
    });
    if (existLike) {
      //이미 좋아요 하고있는경우 -> 좋아요 삭제
      const newLike = existLike.likers.filter(liker => liker.id !== profile.id);
      await this.tasteRepository.save(newLike);
      return false;
    }
    if (existTaste) {
      //이미 존재하는 취향 -> 내 좋아요에 추가
      existTaste.likers.push(await user.getProfile());
      await this.tasteRepository.save(existTaste);
      return true;
    } else {
      //새로운 취향 -> 취향 생성 후 좋아요에 추가
      const newTaste = await this.createTaste({
        name: input.name,
        likers: [await user.getProfile()],
      });
      await this.tasteRepository.save(newTaste);
      return true;
    }
  }
}
