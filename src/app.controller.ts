import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRepository } from './User/Repository/user.repository';
import { AuthenticatedGuard } from './Auth/Guard/authenticated.guard';

@Controller()
export class AppController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get('/')
  @UseGuards(AuthenticatedGuard)
  async index(): Promise<any> {
    return { message: 'Hellooo' };
  }
}
