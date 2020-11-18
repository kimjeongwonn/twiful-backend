import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from 'src/profile/profile.module';
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
    ProfileModule,
    TwitterModule,
    UtilModule,
    TypeOrmModule.forFeature([User, FriendRelation]),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
