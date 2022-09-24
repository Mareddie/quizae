import { Controller, Req, Post, UseGuards, Get } from '@nestjs/common';
import { LocalAuthGuard } from '../../../Auth/Guard/local-auth.guard';
import { Request } from 'express';
import { CheckOriginGuard } from '../../../Common/Guard/check-origin.guard';
import { AuthService } from '../../../Auth/Service/auth.service';
import { AuthenticatedUser } from '../../../User/Type/authenticated-user';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';

@Controller()
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(CheckOriginGuard, LocalAuthGuard)
  @Post('/login')
  async loginUser(@Req() req: Request) {
    return {
      accessToken: await this.authService.generateToken(
        req.user as AuthenticatedUser,
      ),
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('profile')
  checkToken(@Req() req: Request): object {
    return req.user;
  }
}
