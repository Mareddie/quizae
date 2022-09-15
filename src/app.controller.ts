import { Controller, Get, Render } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRepository } from './User/Repository/user.repository';

@Controller()
export class AppController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get()
  @Render('pages/index')
  async getUsers(): Promise<any> {
    return { message: 'Hellooo' };
  }

  @Get('/login')
  @Render('pages/login')
  async loginUser(): Promise<any> {
    return { message: 'Hellooo' };
  }
}
