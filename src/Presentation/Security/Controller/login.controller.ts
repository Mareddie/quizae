import {
  Controller,
  Get,
  Req,
  Res,
  Post,
  UseGuards,
  Next,
  Redirect,
  UseFilters,
} from '@nestjs/common';
import { LocalAuthGuard } from '../../../Auth/Guard/local-auth.guard';
import { AuthExceptionFilter } from '../../../Common/Filters/auth-exceptions.filter';
import { Response, Request } from 'express';

@Controller()
@UseFilters(AuthExceptionFilter)
export class LoginController {
  @Get('/login')
  loginUserPage(@Req() req: Request, @Res() res: Response) {
    if (req.user) {
      return res.redirect('/');
    }

    return res.render('pages/login', {
      success: req.flash('success'),
      error: req.flash('error'),
      lastUsedEmail: req.flash('lastUsedEmail'),
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @Redirect('/')
  loginUser() {
    return;
  }

  @Get('/logout')
  logoutUser(@Req() req: Request, @Res() res: Response, @Next() next) {
    // If the User isn't logged in, we should redirect without flash message
    if (!req.user) {
      return res.redirect('/login');
    }

    req.logOut(function (error) {
      if (error) {
        return next(error);
      }

      req.flash('success', 'Logged out.');
      return res.redirect('/login');
    });
  }
}
