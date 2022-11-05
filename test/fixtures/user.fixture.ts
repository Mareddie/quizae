import { AbstractFixture } from './abstract.fixture';
import { LoginFixtureData } from './login.fixture';
import { PrismaService } from '../../src/Common/Service/prisma.service';
import * as argon2 from 'argon2';
import { AuthenticatedUser } from '../../src/User/Type/authenticated-user';

export class UserFixture implements AbstractFixture<LoginFixtureData> {
  private createdUserId: string;

  constructor(private readonly prisma: PrismaService) {}

  public async up(): Promise<LoginFixtureData> {
    const createdUser = await this.prisma.user.create({
      data: {
        email: 'updatetest@runner.test',
        firstName: 'Updater',
        lastName: 'Updating',
        password: await argon2.hash('testing'),
      },
    });

    delete createdUser.password;
    this.createdUserId = createdUser.id;

    return { user: createdUser as AuthenticatedUser };
  }

  public async down(): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: this.createdUserId,
      },
    });
  }
}
