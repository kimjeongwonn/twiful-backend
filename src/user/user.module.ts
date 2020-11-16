import { HttpModule, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { User } from './models/user.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRelation } from './models/friendRelation.model';
import { TwitterModule } from '../twitter/twitter.module';
import { AuthModule } from '../auth/auth.module';
import { UtilModule } from '../util/util.module';

@Module({
  imports: [
    UtilModule,
    AuthModule,
    TwitterModule,
    TypeOrmModule.forFeature([User, FriendRelation]),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
