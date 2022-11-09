import { AbstractFixture } from './abstract.fixture';
import { PrismaService } from '../../src/Common/Service/prisma.service';
import { AuthenticatedUser } from '../../src/User/Type/authenticated-user';
import * as argon2 from 'argon2';

export interface LoginFixtureData {
  user: AuthenticatedUser;
}

export class LoginFixture implements AbstractFixture<LoginFixtureData> {
  constructor(private readonly prisma: PrismaService) {}

  public async up(): Promise<LoginFixtureData> {
    const createdUser = await this.prisma.user.create({
      data: {
        email: 'tester@runner.test',
        password: await argon2.hash('testing'),
        firstName: 'Tester',
        lastName: 'Testerovic',
      },
    });

    delete createdUser.password;

    return { user: createdUser as AuthenticatedUser };
  }

  public async down(): Promise<void> {
    await this.prisma.user.delete({
      where: {
        email: 'tester@runner.test',
      },
    });
  }
}
