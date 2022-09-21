import {
  ExecutionContext,
  Injectable,
  CanActivate,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.isAuthenticated() === false) {
      throw new ForbiddenException(
        'You need to be logged in to access this page.',
      );
    }

    return true;
  }
}
