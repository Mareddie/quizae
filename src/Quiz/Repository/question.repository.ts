import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import {
  QuestionCandidateForGame,
  QuestionWithAnswers,
} from '../Type/question-with-answers';
import { Prisma, Question } from '@prisma/client';
import { CreateUpdateQuestionDTO } from '../DTO/create-update-question.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

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

    const updateQuery = {
      where: {
        id: questionId,
      },
      data: {
        text: data.text,
        // TODO this wont work, fix this
        correctAnswerId: data.correctAnswer.id,
        answers: {
          createMany: {
            data: [],
          },
        },
      },
      include: {
        answers: true,
      },
    };

    if (data.answers !== undefined) {
      for (const answer of data.answers) {
        updateQuery.data.answers.createMany.data.push({
          id: answer.id,
          text: answer.text,
          priority: answer.priority,
        });
      }
    }

    return this.prisma.question.update(updateQuery);
  }

  async createQuestion(categoryId: string, data: CreateUpdateQuestionDTO) {
    if (data.answers === undefined || data.correctAnswer === undefined) {
      throw new Error(
        'Question on creation must have correct answer and answers defined',
      );
    }

    const questionId = uuidv4();

    // TODO: process correct answer

    return this.prisma.question.create({
      data: {
        id: questionId,
        categoryId: categoryId,
        text: data.text,
        answers: {
          createMany: {
            data: data.answers as Prisma.AnswerCreateManyInput[],
          },
        },
      },
      include: {
        answers: true,
      },
    });
  }
}
