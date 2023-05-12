import { AuthenticatedUser } from '../../src/User/Type/authenticated-user';
import { AbstractFixture } from './abstract.fixture';
import { PrismaService } from '../../src/Common/Service/prisma.service';
import * as argon2 from 'argon2';
import { QuestionCategory, Prisma } from '@prisma/client';
import { QuestionWithAnswers } from '../../src/Quiz/Type/question-with-answers';

export interface GameSessionFixtureData {
  user: AuthenticatedUser;
  questionCategory: QuestionCategory;
  questionsWithAnswers: QuestionWithAnswers[];
}

export class GameSessionFixture
  implements AbstractFixture<GameSessionFixtureData>
{
  constructor(private readonly prisma: PrismaService) {}
  private data: GameSessionFixtureData;

  public async up(): Promise<GameSessionFixtureData> {
    const firstUser = await this.prisma.user.create({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
      data: {
        email: 'gametester@test.game',
        firstName: 'Gamie',
        lastName: 'Administrator',
        password: await argon2.hash('testing'),
      },
    });

    const questionCategory = await this.prisma.questionCategory.create({
      data: {
        name: 'Games',
        userId: firstUser.id,
        priority: 10,
      },
    });

    const categoryQuestions: Prisma.QuestionCreateInput[] = [
      {
        category: {
          connect: {
            id: questionCategory.id,
          },
        },
        text: "Who owns Assassin's Creed IP?",
        answers: {
          create: [
            {
              text: 'Electronic Arts',
              priority: 1,
              isCorrect: false,
            },
            {
              text: 'Ubisoft',
              priority: 2,
              isCorrect: true,
            },
            {
              text: 'Square Enix',
              priority: 3,
              isCorrect: false,
            },
          ],
        },
      },
      {
        category: {
          connect: {
            id: questionCategory.id,
          },
        },
        text: 'What is current Xbox console name?',
        answers: {
          create: [
            {
              text: 'Xbox One X',
              priority: 1,
              isCorrect: false,
            },
            {
              text: 'Xbox Ultra',
              priority: 2,
              isCorrect: false,
            },
            {
              text: 'Xbox Series X',
              priority: 3,
              isCorrect: true,
            },
          ],
        },
      },
    ];

    const createdQuestionsWithAnswers: QuestionWithAnswers[] = [];

    for (const question of categoryQuestions) {
      createdQuestionsWithAnswers.push(
        await this.prisma.question.create({
          include: {
            answers: true,
          },
          data: question,
        }),
      );
    }

    this.data = {
      user: firstUser,
      questionCategory: questionCategory,
      questionsWithAnswers: createdQuestionsWithAnswers,
    };

    return this.data;
  }

  public async down(): Promise<void> {
    await this.prisma.questionCategory.deleteMany({
      where: {
        userId: this.data.user.id,
      },
    });

    await this.prisma.game.deleteMany({
      where: {
        startedById: this.data.user.id,
      },
    });

    await this.prisma.user.deleteMany({
      where: {
        id: this.data.user.id,
      },
    });

    return;
  }
}
