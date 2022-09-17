import { ForbiddenException } from '@nestjs/common';

export class InvalidCredentialsException extends ForbiddenException {
  constructor(message: string) {
    super(message);
  }
}
