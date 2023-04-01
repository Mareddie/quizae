import { AuthenticatedUser } from '../../src/User/Type/authenticated-user';
import { Group, QuestionCategory } from '@prisma/client';
import { AbstractFixture } from './abstract.fixture';
import { PrismaService } from '../../src/Common/Service/prisma.service';
import * as argon2 from 'argon2';

export interface QuestionFixtureData {
  user: AuthenticatedUser;
  group: Group;
  questionCategory: QuestionCategory;
}

export class QuestionFixture implements AbstractFixture<QuestionFixtureData> {
  constructor(private readonly prisma: PrismaService) {}
  private data: QuestionFixtureData;

  public async up(): Promise<QuestionFixtureData> {
    const selectQuery = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    };

    const usersToCreate = [
      {
        email: 'questiontester@testing.com',
        firstName: 'Uther',
        lastName: 'Creator',
        password: await argon2.hash('testing'),
      },
    ];

    const [firstUser] = await Promise.all(
      usersToCreate.map(
        async (userData) =>
          await this.prisma.user.create({
            select: selectQuery,
            data: userData,
          }),
      ),
    );

    const groupWithCategory = await this.prisma.group.create({
      include: {
        questionCategories: true,
      },
      data: {
        name: 'Testing of Question Creation',
        ownerId: firstUser.id,
        questionCategories: {
          createMany: {
            data: [
              {
                name: 'Testing',
                order: 1,
              },
            ],
          },
        },
      },
    });

    const { questionCategories, ...group } = groupWithCategory;

    this.data = {
      user: firstUser,
      group,
      questionCategory: questionCategories[0],
    };

    return this.data;
  }

  public async down(): Promise<void> {
    await this.prisma.user.deleteMany({
      where: {
        id: {
          in: [this.data.user.id],
        },
      },
    });

    return;
  }
}
