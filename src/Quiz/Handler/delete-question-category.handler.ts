import { ConflictException, Injectable } from '@nestjs/common';
import { QuestionCategoryRepository } from '../Repository/question-category.repository';

@Injectable()
export class DeleteQuestionCategoryHandler {
  constructor(
    private readonly questionCategoryRepository: QuestionCategoryRepository,
  ) {}

  async deleteQuestionCategory(
    groupId: string,
    questionCategoryId: string,
  ): Promise<void> {
    const predicate = await this.questionCategoryRepository.fetchById(
      questionCategoryId,
    );

    if (predicate === null || predicate.groupId !== groupId) {
      throw new ConflictException(
        'Question Category was not found or is not part of this Group',
      );
    }

    await this.questionCategoryRepository.deleteQuestionCategory(
      questionCategoryId,
    );
  }
}
