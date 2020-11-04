import {
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwitterAuthGuard } from './guards/twitter-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(TwitterAuthGuard)
  @Get('twitter_login')
  twitterLogin(@Req() req: Express.Request) {}

  @UseGuards(TwitterAuthGuard)
  @Get('twitter_callback')
  twitterCallbacks(@Req() req: Express.Request) {
    req.session.jwt = this.authService.signToken(req.user);
    return '<script>window.history.back()</script>';
  }

  @Get('get_jwt')
  getTwitterToken(@Req() req: Express.Request) {
    return req.session.jwt;
  }
}
