import { AuthenticatedUser } from '../../User/Type/authenticated-user';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
