import { AuthenticatedUser } from '../../src/User/Type/authenticated-user';
import { AbstractFixture } from './abstract.fixture';
import { PrismaService } from '../../src/Common/Service/prisma.service';
import * as argon2 from 'argon2';
import { QuestionCategory } from '@prisma/client';

export interface QuestionCategoryFixtureData {
  user: AuthenticatedUser;
  questionCategory: QuestionCategory;
}

export interface UserInitData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface CategoryInitData {
  name: string;
}

export class QuestionCategoryFixture
  implements AbstractFixture<QuestionCategoryFixtureData>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly userData?: UserInitData,
    private readonly categoryData?: CategoryInitData,
  ) {}

  private data: QuestionCategoryFixtureData;

  public async up(): Promise<QuestionCategoryFixtureData> {
    const userData = this.getUserInitData();

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: await argon2.hash(userData.password),
      },
    });

    const questionCategory = await this.prisma.questionCategory.create({
      data: {
        name: this.getCategoryInitData().name,
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

  private getCategoryInitData(): CategoryInitData {
    if (this.categoryData) {
      return this.categoryData;
    }

    return {
      name: 'Testing Category',
    };
  }

  private getUserInitData(): UserInitData {
    if (this.userData) {
      return this.userData;
    }

    return {
      email: 'quescat@testing.test',
      firstName: 'Alfa',
      lastName: 'QuestionUser',
      password: 'testing',
    };
  }
}
