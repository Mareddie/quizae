import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../Service/auth.service';
import { InvalidCredentialsException } from '../../Common/Exceptions/invalid-credentials.exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);

    if (user === null) {
      throw new InvalidCredentialsException(
        "These credentials don't match our records",
      );
    }

    return user;
  }
}
