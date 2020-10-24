import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Review } from './models/review.model';

@Injectable()
export class ReviewService {
  constructor(
    @Inject('REVIEW_REPOSITORY') private userRepository: Repository<Review>,
  ) {}
}
