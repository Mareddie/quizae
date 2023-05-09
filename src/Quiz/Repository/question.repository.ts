import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import {
  QuestionCandidateForGame,
  QuestionForGameProgress,
  QuestionWithAnswers,
} from '../Type/question-with-answers';
import { Question } from '@prisma/client';
import { CreateUpdateQuestionDTO } from '../DTO/create-update-question.dto';

@Injectable()
export class QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async fetchForGameProgress(
    questionId: string,
    gameId: string,
    startedById: string,
  ): Promise<QuestionForGameProgress | undefined> {
    return this.prisma.question.findFirst({
      select: {
        id: true,
        text: true,
        answers: {
          select: {
            id: true,
            text: true,
            isCorrect: true,
          },
        },
      },
      // The question must be made by the user that started the game
      // The question must not have been answered in the game
      where: {
        id: questionId,
        answeredQuestions: {
          none: {
            gameId: gameId,
          },
        },
        category: {
          is: {
            userId: startedById,
          },
        },
      },
    });
  }

  async fetchCandidatesForGame(
    categoryId: string,
    gameId: string,
  ): Promise<QuestionCandidateForGame[]> {
    return this.prisma.question.findMany({
      select: {
        id: true,
        text: true,
        answers: {
          select: {
            id: true,
            text: true,
            priority: true,
          },
          orderBy: {
            priority: 'desc',
          },
        },
      },
      // Returns all Questions within a category that were not yet answered during a game
      where: {
        category: {
          id: categoryId,
        },
        answeredQuestions: {
          none: {
            gameId: gameId,
          },
        },
      },
    });
  }

  async fetchQuestions(categoryId: string): Promise<QuestionWithAnswers[]> {
    return this.prisma.question.findMany({
      where: {
        categoryId: categoryId,
      },
      include: {
        answers: true,
      },
    });
  }

  async fetchByIdAndCategory(
    categoryId: string,
    questionId: string,
  ): Promise<QuestionWithAnswers | null> {
    return this.prisma.question.findFirst({
      where: {
        categoryId: categoryId,
        id: questionId,
      },
      include: {
        answers: true,
      },
    });
  }

  async fetchByTextAndCategory(
    categoryId: string,
    text: string,
  ): Promise<Question | null> {
    return this.prisma.question.findFirst({
      where: {
        categoryId: categoryId,
        text: text,
      },
    });
  }

  async deleteQuestion(questionId: string): Promise<QuestionWithAnswers> {
    return this.prisma.question.delete({
      where: {
        id: questionId,
      },
      include: {
        answers: true,
      },
    });
  }

  async updateQuestion(
    questionId: string,
    data: CreateUpdateQuestionDTO,
  ): Promise<QuestionWithAnswers> {
    const deleteAnswersQuery = {
      where: {
        questionId: questionId,
      },
    };

    await this.prisma.answer.deleteMany(deleteAnswersQuery);

    return this.prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        text: data.text,
        answers: {
          createMany: {
            data: data.answers,
          },
        },
      },
      include: {
        answers: true,
      },
    });
  }

  async createQuestion(categoryId: string, data: CreateUpdateQuestionDTO) {
    if (data.answers === undefined) {
      throw new Error(
        'Question on creation must have correct answer and answers defined',
      );
    }

    return this.prisma.question.create({
      data: {
        categoryId: categoryId,
        text: data.text,
        answers: {
          createMany: {
            data: data.answers,
          },
        },
      },
      include: {
        answers: true,
      },
    });
  }
}
