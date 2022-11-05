import { AuthenticatedUser } from '../../src/User/Type/authenticated-user';
import { AbstractFixture } from './abstract.fixture';
import { PrismaService } from '../../src/Common/Service/prisma.service';
import * as argon2 from 'argon2';
import { Group, QuestionCategory } from '@prisma/client';

export interface QuestionCategoryFixtureData {
  firstUser: AuthenticatedUser;
  secondUser: AuthenticatedUser;
  group: Group;
  categories: QuestionCategory[];
}

export class QuestionCategoryFixture
  implements AbstractFixture<QuestionCategoryFixtureData>
{
  constructor(private readonly prisma: PrismaService) {}
  private data: QuestionCategoryFixtureData;

  public async up(): Promise<QuestionCategoryFixtureData> {
    const selectQuery = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    };

    const usersToCreate = [
      {
        email: 'quescat@testing.test',
        firstName: 'Alfa',
        lastName: 'QuestionUser',
        password: await argon2.hash('testing'),
      },
      {
        email: 'secondquescat@testing.test',
        firstName: 'Beta',
        lastName: 'QuestionUser',
        password: await argon2.hash('testing'),
      },
    ];

    const [firstUser, secondUser] = await this.prisma.$transaction(
      usersToCreate.map((userData) =>
        this.prisma.user.create({ select: selectQuery, data: userData }),
      ),
    );

    const groupWithCategory = await this.prisma.group.create({
      include: {
        questionCategories: true,
      },
      data: {
        name: 'Group With Questions',
        ownerId: firstUser.id,
        questionCategories: {
          createMany: {
            data: [
              {
                name: 'Essentials',
                order: 1,
              },
              {
                name: 'History',
                order: 2,
              },
            ],
          },
        },
      },
    });

    const { questionCategories, ...group } = groupWithCategory;

    this.data = {
      firstUser,
      secondUser,
      group,
      categories: questionCategories,
    };
    return this.data;
  }

  public async down(): Promise<void> {
    await this.prisma.user.deleteMany({
      where: {
        id: {
          in: [this.data.firstUser.id, this.data.secondUser.id],
        },
      },
    });

    return;
  }
}
