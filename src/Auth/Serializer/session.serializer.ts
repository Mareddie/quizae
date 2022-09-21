import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../User/Repository/user.repository';
import { User } from '@prisma/client';
import { AuthenticatedUser } from '../../User/Type/authenticated-user';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  serializeUser(user: any, done: (err: Error, user: any) => void): void {
    done(null, user);
  }

  deserializeUser(
    payload: any,
    done: (err: string, payload: any) => void,
  ): void {
    this.userRepository
      .findById(payload.id)
      .then((user: User | null) => this.prepareUserObject(payload, user, done))
      .catch((err) => done(err, null));
  }

  private prepareUserObject(
    payload: any,
    user: User | null,
    done: (err: string, payload: any) => void,
  ): any {
    if (user === null) {
      return done(null, null);
    }

    const userObject = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    } as AuthenticatedUser;

    done(null, userObject);
  }
}
