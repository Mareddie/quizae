import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { QuestionWithAnswers } from '../Type/question-with-answers';
import { Question } from '@prisma/client';

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
}
