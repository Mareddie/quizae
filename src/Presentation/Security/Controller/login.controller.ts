import { Controller, Get, Render } from '@nestjs/common';
import { UserRepository } from '../../../User/Repository/user.repository';

@Controller()
export class LoginController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get('/login')
  @Render('pages/login')
  async loginUser(): Promise<any> {
    return { message: 'Hellooo' };
  }
}
