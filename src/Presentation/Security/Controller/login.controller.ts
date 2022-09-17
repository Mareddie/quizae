import {
  Controller,
  Get,
  Request,
  Response,
  Post,
  UseGuards,
  Next,
  Redirect,
  UseFilters,
} from '@nestjs/common';
import { LocalAuthGuard } from '../../../Auth/Guard/local-auth.guard';
import { AuthExceptionFilter } from '../../../Common/Filters/auth-exceptions.filter';

@Controller()
@UseFilters(AuthExceptionFilter)
export class LoginController {
  @Get('/login')
  loginUserPage(@Request() req, @Response() res) {
    if (req.user) {
      return res.redirect('/');
    }

    return res.render('pages/login', {
      success: req.flash('success'),
      error: req.flash('error'),
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @Redirect('/')
  loginUser() {
    return;
  }

  @Get('/user-logout')
  logoutUser(@Request() req, @Response() res, @Next() next) {
    req.logOut(function (error) {
      if (error) {
        return next(error);
      }

      req.flash('success', 'Logged out.');
      return res.redirect('/login');
    });
  }
}
