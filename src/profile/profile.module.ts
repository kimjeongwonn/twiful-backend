import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { Profile } from './models/profile.model';
import { profileProviders } from './profile.provider';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  imports: [DatabaseModule],
  providers: [ProfileService, ProfileResolver, Profile, ...profileProviders],
})
export class ProfileModule {}
