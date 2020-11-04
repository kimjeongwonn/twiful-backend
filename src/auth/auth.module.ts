import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/models/user.model';
import { AuthService } from './auth.service';
import { TwitterStrategy } from './twitter.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { Profile } from 'src/profile/models/profile.model';
import { TwitterAuthGuard } from './guards/twitter-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
require('dotenv').config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, TwitterStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
