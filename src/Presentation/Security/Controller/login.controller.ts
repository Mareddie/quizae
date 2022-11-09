import { Controller, Req, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../../../Auth/Guard/local-auth.guard';
import { Request } from 'express';
import { AuthService } from '../../../Auth/Service/auth.service';
import { AuthenticatedUser } from '../../../User/Type/authenticated-user';

@Controller()
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async loginUser(@Req() req: Request) {
    return {
      accessToken: await this.authService.generateToken(
        req.user as AuthenticatedUser,
      ),
    };
  }
}
