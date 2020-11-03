import { HttpModule, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { User } from './models/user.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRelation } from './models/friendRelation.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FriendRelation]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
