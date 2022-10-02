import {
  ExecutionContext,
  Injectable,
  CanActivate,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class CheckObjectIdGuard implements CanActivate {
  constructor(private readonly idProperty: string) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.params.hasOwnProperty(this.idProperty) === false) {
      throw new BadRequestException(
        'Property ID was not found in request params',
      );
    }

    const objectIdCandidate = request.params[this.idProperty];

    if (typeof objectIdCandidate !== 'string') {
      throw new BadRequestException('Property ID must be a string');
    }

    if (objectIdCandidate.match(/^[0-9a-fA-F]{24}$/) !== null) {
      return true;
    }

    throw new BadRequestException(
      `Parameter '${this.idProperty}' must be a valid Object ID`,
    );
  }
}
