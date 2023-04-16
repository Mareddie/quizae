import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { QuestionCategory } from '@prisma/client';
import { CreateUpdateQuestionCategoryDTO } from '../DTO/create-update-question-category.dto';
import { QuestionCountByCategory } from '../Type/question-with-answers';

@Injectable()
export class QuestionCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getForGame(startedById: string): Promise<QuestionCountByCategory[]> {
    return this.prisma.questionCategory.findMany({
      select: {
        id: true,
        name: true,
        priority: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      where: {
        userId: startedById,
      },
      orderBy: {
        priority: 'desc',
      },
    });
  }

  async fetchById(categoryId: string): Promise<QuestionCategory | null> {
    return this.prisma.questionCategory.findUnique({
      where: {
        id: categoryId,
      },
    });
  }

  async fetchForUser(
    userId: string,
    name?: string,
  ): Promise<QuestionCategory[]> {
    return this.prisma.questionCategory.findMany({
      where: {
        userId: userId,
        name: name,
      },
    });
  }

  async createForUser(
    userId: string,
    data: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    return this.prisma.questionCategory.create({
      data: {
        name: data.name,
        userId: userId,
        priority: data.priority,
      },
    });
  }

  async updateQuestionCategory(
    questionCategoryId: string,
    data: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    return this.prisma.questionCategory.update({
      where: {
        id: questionCategoryId,
      },
      data: {
        name: data.name,
        priority: data.priority,
      },
    });
  }

  async deleteQuestionCategory(
    questionCategoryId: string,
  ): Promise<QuestionCategory> {
    return this.prisma.questionCategory.delete({
      where: {
        id: questionCategoryId,
      },
    });
  }
}
