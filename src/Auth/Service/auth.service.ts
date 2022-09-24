import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../User/Repository/user.repository';
import * as argon2 from 'argon2';
import { AuthenticatedUser } from '../../User/Type/authenticated-user';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.userRepository.findByEmail(email);

    if (user === null) {
      return null;
    }

    const passwordVerified = await argon2.verify(user.password, pass);

    if (passwordVerified) {
      delete user.password;

      return user as AuthenticatedUser;
    }

    return null;
  }

  async generateToken(user: AuthenticatedUser): Promise<string> {
    const payload = { username: user.email, sub: user.id };

    return await this.jwtService.signAsync(payload);
  }
}
