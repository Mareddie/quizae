import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { QuestionWithAnswers } from '../Type/question-with-answers';
import { Question } from '@prisma/client';
import { CreateUpdateQuestionDTO } from '../DTO/create-update-question.dto';

@Injectable()
export class QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async fetchQuestions(
    groupId: string,
    userId?: string,
  ): Promise<QuestionWithAnswers[]> {
    return this.prisma.question.findMany({
      where: {
        groupId: groupId,
        userId: userId,
      },
      include: {
        answers: true,
      },
    });
  }

  async fetchByIdAndGroup(
    groupId: string,
    questionId: string,
  ): Promise<QuestionWithAnswers | null> {
    return this.prisma.question.findFirst({
      where: {
        groupId: groupId,
        id: questionId,
      },
      include: {
        answers: true,
      },
    });
  }

  async fetchByTextAndGroup(
    groupId: string,
    text: string,
  ): Promise<Question | null> {
    return this.prisma.question.findFirst({
      where: {
        groupId: groupId,
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

    const [, updateResult] = await this.prisma.$transaction([
      this.prisma.answer.deleteMany(deleteAnswersQuery),
      this.prisma.question.update(updateQuery),
    ]);

    return updateResult;
  }

  async createQuestion(
    groupId: string,
    userId: string,
    data: CreateUpdateQuestionDTO,
  ): Promise<QuestionWithAnswers> {
    const createQuery = {
      data: {
        groupId: groupId,
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
