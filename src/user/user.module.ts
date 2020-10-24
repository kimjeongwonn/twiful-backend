import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { userProviders } from './user.provider';
import { DatabaseModule } from '../database/database.module';
import { UserResolver } from './user.resolver';
import { User } from './models/user.model';

@Module({
  imports: [DatabaseModule],
  providers: [UserService, UserResolver, User, ...userProviders],
})
export class UserModule {}
