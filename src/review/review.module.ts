import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { Review } from './models/review.model';
import { ReviewResolver } from './review.resolver';
import { ReviewService } from './review.service';
import { reviewProviders } from './review.provider';

@Module({
  imports: [DatabaseModule],
  providers: [ReviewService, ReviewResolver, Review, ...reviewProviders],
})
export class ReviewModule {}
