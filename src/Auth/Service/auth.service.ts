import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../User/Repository/user.repository';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findByEmail(email);

    if (user === null) {
      return null;
    }

    const passwordVerified = await argon2.verify(user.password, pass);

    if (passwordVerified) {
      delete user.password;

      return user;
    }

    return null;
  }
}
