import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../../User/Type/authenticated-user';
import { JsonWebToken } from '../Type/json-web-token';
import { UserRepository } from '../../User/Repository/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'changeme'),
    });
  }

  async validate(payload: JsonWebToken): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findById(payload.sub);

    if (user === null) {
      throw new UnauthorizedException(
        'Subject from decoded token was not found',
      );
    }

    delete user.password;

    return user as AuthenticatedUser;
  }
}
