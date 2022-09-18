import { Controller, Get, Render, UseFilters, UseGuards } from '@nestjs/common';
import { UserRepository } from './User/Repository/user.repository';
import { AuthenticatedGuard } from './Auth/Guard/authenticated.guard';
import { AuthExceptionFilter } from './Common/Filters/auth-exceptions.filter';

@Controller()
@UseFilters(AuthExceptionFilter)
export class AppController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get('/')
  @UseGuards(AuthenticatedGuard)
  @Render('pages/index')
  async index(): Promise<any> {
    return { message: 'Hellooo' };
  }
}
