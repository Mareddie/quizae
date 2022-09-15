import { Controller, Get, Render } from '@nestjs/common';
import { UserRepository } from './User/Repository/user.repository';

@Controller()
export class AppController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get()
  @Render('pages/index')
  async getUsers(): Promise<any> {
    return { message: 'Hellooo' };
  }
}
