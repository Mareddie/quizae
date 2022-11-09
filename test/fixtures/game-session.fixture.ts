import { AuthenticatedUser } from '../../src/User/Type/authenticated-user';
import { AbstractFixture } from './abstract.fixture';
import { PrismaService } from '../../src/Common/Service/prisma.service';
import * as argon2 from 'argon2';
import { Group, Question, QuestionCategory, Answer } from '@prisma/client';
import { ObjectID } from 'bson';

export interface GameSessionFixtureData {
  user: AuthenticatedUser;
  group: Group;
  questionCategory: QuestionCategory;
  questions: Question[];
  answers: Answer[];
}

export class GameSessionFixture
  implements AbstractFixture<GameSessionFixtureData>
{
  constructor(private readonly prisma: PrismaService) {}
  private data: GameSessionFixtureData;

  public async up(): Promise<GameSessionFixtureData> {
    const selectQuery = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    };

    const usersToCreate = [
      {
        email: 'gametester@test.game',
        firstName: 'Gamie',
        lastName: 'Administrator',
        password: await argon2.hash('testing'),
      },
    ];

    const [firstUser] = await this.prisma.$transaction(
      usersToCreate.map((userData) =>
        this.prisma.user.create({ select: selectQuery, data: userData }),
      ),
    );

    const groupWithCategory = await this.prisma.group.create({
      include: {
        questionCategories: true,
      },
      data: {
        name: 'Gaming Group',
        ownerId: firstUser.id,
        questionCategories: {
          createMany: {
            data: [
              {
                name: 'Games',
                order: 1,
              },
            ],
          },
        },
      },
    });

    const { questionCategories, ...group } = groupWithCategory;

    const categoryQuestions = [
      {
        id: new ObjectID().toString(),
        userId: firstUser.id,
        categoryId: questionCategories[0].id,
        text: "Who owns Assassin's Creed IP?",
        correctAnswer: undefined,
      },
      {
        id: new ObjectID().toString(),
        userId: firstUser.id,
        categoryId: questionCategories[0].id,
        text: 'What is current Xbox console name?',
        correctAnswer: undefined,
      },
    ];

    const questionsAnswers = [
      {
        id: new ObjectID().toString(),
        questionId: categoryQuestions[0].id,
        text: 'Electronic Arts',
        order: 1,
      },
      {
        id: new ObjectID().toString(),
        questionId: categoryQuestions[0].id,
        text: 'Ubisoft',
        order: 2,
      },
      {
        id: new ObjectID().toString(),
        questionId: categoryQuestions[0].id,
        text: 'Square Enix',
        order: 3,
      },
      {
        id: new ObjectID().toString(),
        questionId: categoryQuestions[1].id,
        text: 'Xbox One X',
        order: 1,
      },
      {
        id: new ObjectID().toString(),
        questionId: categoryQuestions[1].id,
        text: 'Xbox Ultra',
        order: 2,
      },
      {
        id: new ObjectID().toString(),
        questionId: categoryQuestions[1].id,
        text: 'Xbox Series X',
        order: 3,
      },
    ];

    categoryQuestions[0].correctAnswer = questionsAnswers[1].id;
    categoryQuestions[1].correctAnswer = questionsAnswers[5].id;

    await this.prisma.$transaction([
      this.prisma.question.createMany({ data: categoryQuestions }),
      this.prisma.answer.createMany({ data: questionsAnswers }),
    ]);

    this.data = {
      user: firstUser,
      group,
      questionCategory: questionCategories[0],
      questions: categoryQuestions,
      answers: questionsAnswers,
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
