import { ConflictException, Injectable } from '@nestjs/common';
import { QuestionCategoryRepository } from '../Repository/question-category.repository';
import { CreateUpdateQuestionCategoryDTO } from '../DTO/create-update-question-category.dto';
import { QuestionCategory } from '@prisma/client';

@Injectable()
export class CreateUpdateQuestionCategoryHandler {
  constructor(
    private readonly questionCategoryRepository: QuestionCategoryRepository,
  ) {}

  async createQuestionCategory(
    groupId: string,
    data: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    await this.testQuestionCategoryUniqueness(groupId, data.name);

    return this.questionCategoryRepository.createForGroup(groupId, data);
  }

  async updateQuestionCategory(
    questionCategoryId: string,
    groupId: string,
    data: CreateUpdateQuestionCategoryDTO,
  ): Promise<QuestionCategory> {
    await this.testQuestionCategoryUniqueness(groupId, data.name);

    return this.questionCategoryRepository.updateQuestionCategory(
      questionCategoryId,
      data,
    );
  }

  private async testQuestionCategoryUniqueness(
    groupId: string,
    name: string,
  ): Promise<void> {
    const predicate = await this.questionCategoryRepository.fetchForGroup(
      groupId,
      name,
    );

    if (predicate.length !== 0) {
      throw new ConflictException(
        'Question Category with this name already exists.',
      );
    }
  }
}
