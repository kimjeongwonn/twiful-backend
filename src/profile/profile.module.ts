import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taste } from '../taste/models/taste.model';
import { AuthModule } from '../auth/auth.module';
import { RecruitModule } from '../recruit/recruit.module';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { Review } from '../review/models/review.model';
import { TasteRelation } from '../taste/models/tasteRelation';

@Module({
  imports: [
    AuthModule,
    RecruitModule,
    TypeOrmModule.forFeature([Link, Profile, Taste, TasteRelation, Review]),
  ],
  providers: [ProfileService, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
