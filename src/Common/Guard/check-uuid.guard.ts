import {
  ExecutionContext,
  Injectable,
  CanActivate,
  BadRequestException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class CheckUuidGuard implements CanActivate {
  constructor(private readonly idProperty: string) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.params.hasOwnProperty(this.idProperty) === false) {
      throw new BadRequestException(
        'Property ID was not found in request params',
      );
    }

    const uuidCandidate = request.params[this.idProperty];

    if (typeof uuidCandidate !== 'string') {
      throw new BadRequestException('Property ID must be a string');
    }

    if (uuidValidate(uuidCandidate) === true) {
      return true;
    }

    throw new BadRequestException(
      `Parameter '${this.idProperty}' must be a valid UUID`,
    );
  }
}
