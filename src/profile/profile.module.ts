import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Link, Profile])],
  providers: [ProfileService, ProfileResolver],
})
export class ProfileModule {}
