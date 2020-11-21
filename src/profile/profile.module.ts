import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RecruitModule } from '../recruit/recruit.module';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Link, Profile]),
    RecruitModule,
  ],
  providers: [ProfileService, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
