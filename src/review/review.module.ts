import { Module } from '@nestjs/common';
import { Review } from './models/review.model';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewResolver } from './review.resolver';
import { ProfileModule } from '../profile/profile.module';
import { TasteModule } from '../taste/taste.module';
import { Notice } from '../notice/models/notice.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Notice]),
    ProfileModule,
    TasteModule,
  ],
  providers: [ReviewService, ReviewResolver],
  exports: [ReviewService],
})
export class ReviewModule {}
