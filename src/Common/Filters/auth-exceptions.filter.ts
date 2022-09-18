import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InvalidCredentialsException } from '../Exceptions/invalid-credentials.exception';

@Catch(HttpException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (
      exception instanceof InvalidCredentialsException &&
      request.body.email
    ) {
      request.flash('lastUsedEmail', request.body.email);
    }

    if (
      exception instanceof ForbiddenException ||
      exception instanceof InvalidCredentialsException
    ) {
      request.flash('error', exception.message);

      response.redirect('/login');
      return;
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
