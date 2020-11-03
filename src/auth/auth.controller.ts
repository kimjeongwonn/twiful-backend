import {
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

declare global {
  namespace Express {
    interface Session {
      token: string;
    }
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('twitter'))
  @Get('twitter_login')
  twitterLogin(@Req() req: Express.Request) {}

  @UseGuards(AuthGuard('twitter'))
  @Get('twitter_callback')
  twitterCallbacks(@Req() req: Express.Request) {
    req.session.set = this.authService.signToken(req.user);
    req.session.save(() => console.log('save!!'));
    return '<script>window.history.back()</script>';
  }
}
