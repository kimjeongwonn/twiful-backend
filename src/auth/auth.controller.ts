import {
  Controller,
  Get,
  Query,
  Redirect,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwitterAuthGuard } from './guards/twitter-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('twitter_login')
  @Redirect('twitter_login_to')
  twitterLoginWithRedirect(
    @Session() session: Express.Session,
    @Query() query: { redirect: string },
  ) {
    session.loginRedirect = query.redirect;
    return;
  }

  @UseGuards(TwitterAuthGuard)
  @Get('twitter_login_to')
  twitterLogin() {}

  @UseGuards(TwitterAuthGuard)
  @Get('twitter_callback')
  twitterCallbacks(@Req() req: Express.Request) {
    let redirectUrl: string = process.env.FRONT_SIGNUP_PAGE; //첫 로그인(가입)
    if (req.user.login)
      redirectUrl = req.session.loginRedirect || process.env.FRONT_HOME_PAGE; // 로그인
    req.session.jwt = this.authService.signToken(req.user);
    return `<script>window.location.href = "${redirectUrl}"</script>`;
  }

  @Get('get_jwt')
  getTwitterToken(@Req() req: Express.Request) {
    const jwt = req.session.jwt;
    req.session.destroy(() => req.session);
    return jwt;
  }
}
