import { ConflictException, Injectable } from '@nestjs/common';
import { QuestionCategoryRepository } from '../Repository/question-category.repository';
import { CreateUpdateQuestionCategoryDTO } from '../DTO/create-update-question-category.dto';
import { QuestionCategory } from '@prisma/client';

@Injectable()
export class QuestionCategoryHandler {
  constructor(
    private readonly questionCategoryRepository: QuestionCategoryRepository,
  ) {}

  async createQuestionCategory(
    userId: string,
    data: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    await this.testQuestionCategoryUniqueness(userId, data.name);

    return this.questionCategoryRepository.createForUser(userId, data);
  }

  async updateQuestionCategory(
    questionCategoryId: string,
    userId: string,
    data: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    const predicate = await this.questionCategoryRepository.fetchForUser(
      userId,
      data.name,
    );

    if (predicate.length !== 0 && predicate[0].id !== questionCategoryId) {
      throw new ConflictException(
        'You cannot use this name - you already have category with such name!',
      );
    }

    return this.questionCategoryRepository.updateQuestionCategory(
      questionCategoryId,
      data,
    );
  }

  async deleteQuestionCategory(
    userId: string,
    questionCategoryId: string,
  ): Promise<void> {
    const predicate = await this.questionCategoryRepository.fetchById(
      questionCategoryId,
    );

    if (predicate === null || predicate.userId !== userId) {
      throw new ConflictException(
        'Question Category was not found or does not belong to authenticated User',
      );
    }

    await this.questionCategoryRepository.deleteQuestionCategory(
      questionCategoryId,
    );
  }

  private async testQuestionCategoryUniqueness(
    userId: string,
    name: string,
  ): Promise<void> {
    const predicate = await this.questionCategoryRepository.fetchForUser(
      userId,
      name,
    );

    if (predicate.length !== 0) {
      throw new ConflictException(
        'Question Category with this name already exists.',
      );
    }
  }
}
