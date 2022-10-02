import {
  ExecutionContext,
  Injectable,
  CanActivate,
  ForbiddenException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class CheckOriginGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const originHeader = request.header('Origin');
    const allowedOrigin = this.config.get<string>(
      'ALLOWED_ORIGIN',
      'http://localhost:3000',
    );

    if (originHeader !== allowedOrigin) {
      throw new ForbiddenException(
        `Request origin does not match or is invalid. Expected: ${allowedOrigin}, actual: ${originHeader}`,
      );
    }

    return true;
  }
}
