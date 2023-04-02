import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { QuestionWithAnswers } from '../Type/question-with-answers';
import { Question } from '@prisma/client';
import { CreateUpdateQuestionDTO } from '../DTO/create-update-question.dto';

@Injectable()
export class QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async fetchQuestions(
    categoryId: string,
    userId?: string,
  ): Promise<QuestionWithAnswers[]> {
    return this.prisma.question.findMany({
      where: {
        categoryId: categoryId,
        userId: userId,
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
        text: {
          equals: text,
          mode: 'insensitive',
        },
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
        correctAnswer: data.correctAnswer,
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
          order: answer.order,
        });
      }
    }

    return this.prisma.question.update(updateQuery);
  }

  async createQuestion(
    categoryId: string,
    userId: string,
    data: CreateUpdateQuestionDTO,
  ): Promise<QuestionWithAnswers> {
    const createQuery = {
      data: {
        categoryId: categoryId,
        userId: userId,
        correctAnswer: data.correctAnswer,
        text: data.text,
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
        createQuery.data.answers.createMany.data.push({
          id: answer.id,
          text: answer.text,
          order: answer.order,
        });
      }
    }

    return this.prisma.question.create(createQuery);
  }
}
