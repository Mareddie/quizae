import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUpdateQuestionDTO } from '../DTO/create-update-question.dto';
import { QuestionRepository } from '../Repository/question.repository';

@Injectable()
export class CreateUpdateQuestionHandler {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async createQuestion(
    groupId: string,
    userId: string,
    data: CreateUpdateQuestionDTO,
  ): Promise<any> {
    const questionCandidate = this.questionRepository.fetchByTextAndGroup(
      groupId,
      data.text,
    );

    // Questions should have a unique text inside a group
    if (questionCandidate !== null) {
      throw new ConflictException('Question with provided text already exists');
    }

    // At this point, we can trust the upper application layer that the provided userId has access to groupId
    // TODO: If the question data have answers, order them by their order, generate IDs, check for correct answer (it must be exactly one)
  }
}
