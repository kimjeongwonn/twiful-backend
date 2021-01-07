import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from '../notice/models/notice.model';
import { ProfileModule } from 'src/profile/profile.module';
import { RecruitModule } from 'src/recruit/recruit.module';
import { AuthModule } from '../auth/auth.module';
import { TwitterModule } from '../twitter/twitter.module';
import { UtilModule } from '../util/util.module';
import { FriendRelation } from './models/friendRelation.model';
import { User } from './models/user.model';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    AuthModule,
    RecruitModule,
    ProfileModule,
    TwitterModule,
    UtilModule,
    TypeOrmModule.forFeature([User, FriendRelation, Notice]),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
