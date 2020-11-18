import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitModule } from 'src/recruit/recruit.module';
import { UserModule } from '../user/user.module';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Link, Profile]), RecruitModule],
  providers: [ProfileService, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
