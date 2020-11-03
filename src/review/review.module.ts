import { Module } from '@nestjs/common';
import { Review } from './models/review.model';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewResolver } from './review.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Review])],
  providers: [ReviewService, ReviewResolver],
})
export class ReviewModule {}
