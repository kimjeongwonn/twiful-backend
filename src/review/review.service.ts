import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './models/review.model';

@Injectable()
export class ReviewService {
  constructor(@InjectRepository(Review) tasteRepository: Repository<Review>) {}
}
