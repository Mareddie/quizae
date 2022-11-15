import { ForbiddenException } from '@nestjs/common';

export class InvalidCredentialsException extends ForbiddenException {
  /* istanbul ignore next */
  constructor(message: string) {
    super(message);
  }
}
