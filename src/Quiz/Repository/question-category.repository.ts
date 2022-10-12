import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { QuestionCategory } from '@prisma/client';

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

  async fetchForGroup(groupId: string): Promise<QuestionCategory[]> {
    return this.prisma.questionCategory.findMany({
      where: {
        groupId: groupId,
      },
    });
  }
}
