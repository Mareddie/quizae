import { ConflictException, Injectable } from '@nestjs/common';
import { QuestionRepository } from '../Repository/question.repository';

@Injectable()
export class DeleteQuestionHandler {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async deleteQuestion(categoryId: string, questionId: string): Promise<void> {
    const questionCandidate =
      await this.questionRepository.fetchByIdAndCategory(
        categoryId,
        questionId,
      );

    if (questionCandidate === null) {
      throw new ConflictException(
        'Question was not found or is not part of provided Category',
      );
    }

    await this.questionRepository.deleteQuestion(questionId);
  }
}
