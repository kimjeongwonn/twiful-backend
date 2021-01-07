import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/models/user.model';
import { FindConditions, FindOneOptions, ObjectID, Repository } from 'typeorm';
import { Review } from './models/review.model';
import { ReviewInputType, reviewType } from './review.resolver';
import { ProfileService } from '../profile/profile.service';
import { TasteService } from '../taste/taste.service';
import { Notice } from '../notice/models/notice.model';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
    private profileService: ProfileService,
    private tasteService: TasteService,
  ) {}

  findOne(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<Review>,
  ): Promise<Review | undefined>;
  findOne(options?: FindOneOptions<Review>): Promise<Review | undefined>;
  findOne(
    conditions?: FindConditions<Review>,
    options?: FindOneOptions<Review>,
  ): Promise<Review | undefined>;
  async findOne(...args): Promise<Review> {
    return this.reviewRepository.findOne(...args);
  }

  async getReviewToAuthor(root: Review) {
    return (
      await this.reviewRepository.findOne(root.id, {
        select: ['id'],
        relations: ['author'],
      })
    ).author;
  }
  async getReviewToProfile(root: Review) {
    return (
      await this.reviewRepository.findOne(root.id, {
        select: ['id'],
        relations: ['toProfile'],
      })
    ).toProfile;
  }
  async getReviewToTaste(root: Review) {
    return (
      await this.reviewRepository.findOne(root.id, {
        select: ['id'],
        relations: ['toTaste'],
      })
    ).toTaste;
  }

  async writeReview(user: User, input: ReviewInputType) {
    //userID가 아니라 profileID를 받음!
    if (!input.text) throw new Error('내용은 필수입니다.');
    const existReview = await this.reviewRepository.findOne({
      [input.toType]: { id: input.toId },
    });
    if (existReview) throw new Error('이미 리뷰를 작성했습니다');
    const target =
      input.toType === 'toTaste'
        ? await this.tasteService.findOne(input.toId)
        : input.toType === 'toProfile'
        ? await this.profileService.findOne(input.toId)
        : null;
    if (!target) throw new Error('타겟이 없습니다!');
    const profile = await user.getProfile();
    if (input.toType === 'toProfile' && profile.id === input.toId)
      throw new Error('자기 자신에게 리뷰를 달 수 없습니다.');
    const newReview = this.reviewRepository.create({
      [input.toType]: target,
      text: input.text,
      author: profile,
    });
    if (input.toType === 'toProfile') {
      //프로필에 리뷰를 달면 알림전송
      const newNotice = await this.noticeRepository.create({
        from: user,
        to: (
          await this.profileService.findOne(input.toId, { relations: ['user'] })
        ).user,
        type: 'WRITED_REVIEW',
      });
      await this.noticeRepository.save(newNotice);
    }

    return this.reviewRepository.save(newReview);
  }
  async editReview(user: User, id: number, text: string) {
    const existReview = await this.reviewRepository.findOne(id, {
      relations: ['author', 'author.user'],
    });
    if (!existReview) throw new Error('수정할 리뷰가 존재하지 않습니다!');
    if (existReview.author.user.id !== user.id)
      throw new Error('자신의 리뷰만 수정할 수 있습니다!');
    const result = await this.reviewRepository.update(existReview, {
      text: text,
    });
    return text;
  }
  async deleteReview(user: User, id: number) {
    const existReview = await this.reviewRepository.findOne(id, {
      relations: ['author', 'author.user'],
    });
    if (!existReview) throw new Error('삭제할 리뷰가 존재하지 않습니다!');
    if (existReview.author.user.id !== user.id)
      throw new Error('자신의 리뷰만 삭제할 수 있습니다!');
    const result = await this.reviewRepository.remove(existReview);
    return !!result;
  }
}
