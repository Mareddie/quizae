import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../User/Repository/user.repository';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findByEmail(email);

    // TODO: password hashing
    if (user && user.password === pass) {
      delete user.password;

      return user;
    }

    return null;
  }
}
