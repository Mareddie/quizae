import { AuthenticatedUser } from '../../src/User/Type/authenticated-user';
import { AbstractFixture } from './abstract.fixture';
import { PrismaService } from '../../src/Common/Service/prisma.service';
import * as argon2 from 'argon2';
import { QuestionCategory } from '@prisma/client';

export interface QuestionCategoryFixtureData {
  user: AuthenticatedUser;
  questionCategory: QuestionCategory;
}

export class QuestionCategoryFixture
  implements AbstractFixture<QuestionCategoryFixtureData>
{
  constructor(private readonly prisma: PrismaService) {}

  private data: QuestionCategoryFixtureData;

  public async up(): Promise<QuestionCategoryFixtureData> {
    const user = await this.prisma.user.create({
      data: {
        email: 'quescat@testing.test',
        firstName: 'Alfa',
        lastName: 'QuestionUser',
        password: await argon2.hash('testing'),
      },
    });

    const questionCategory = await this.prisma.questionCategory.create({
      data: {
        name: 'Testing Category',
        userId: user.id,
        priority: 10,
      },
    });

    this.data = {
      user,
      questionCategory,
    };

    return this.data;
  }

  public async down(): Promise<void> {
    await this.prisma.questionCategory.deleteMany({
      where: {
        OR: [
          { id: this.data.questionCategory.id },
          { userId: this.data.user.id },
        ],
      },
    });

    await this.prisma.user.delete({
      where: {
        id: this.data.user.id,
      },
    });
  }
}
