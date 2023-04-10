import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { QuestionCategory } from '@prisma/client';
import { CreateUpdateQuestionCategoryDTO } from '../DTO/create-update-question-category.dto';

@Injectable()
export class QuestionCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

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
        order: data.order,
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
        order: data.order,
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
