import { ConflictException, Injectable } from '@nestjs/common';
import { QuestionRepository } from '../Repository/question.repository';

@Injectable()
export class DeleteQuestionHandler {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async deleteQuestion(groupId: string, questionId: string): Promise<void> {
    const questionCandidate = await this.questionRepository.fetchByIdAndGroup(
      groupId,
      questionId,
    );

    if (questionCandidate === null) {
      throw new ConflictException(
        'Question was not found or is not part of provided Group',
      );
    }

    await this.questionRepository.deleteQuestion(questionId);
  }
}
