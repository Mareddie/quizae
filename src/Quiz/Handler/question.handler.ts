import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUpdateQuestionDTO } from '../DTO/create-update-question.dto';
import { QuestionRepository } from '../Repository/question.repository';
import { CreateUpdateAnswerDTO } from '../DTO/create-update-answer.dto';
import { QuestionWithAnswers } from '../Type/question-with-answers';

@Injectable()
export class QuestionHandler {
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

  async updateQuestion(
    questionId: string,
    categoryId: string,
    data: CreateUpdateQuestionDTO,
  ): Promise<QuestionWithAnswers> {
    const questionCandidate =
      await this.questionRepository.fetchByIdAndCategory(
        categoryId,
        questionId,
      );

    if (questionCandidate === null) {
      throw new ConflictException(
        "Question for update was not found - it probably doesn't exist or belongs to another category.",
      );
    }

    this.checkAnswers(data.answers);

    return this.questionRepository.updateQuestion(questionId, data);
  }

  async createQuestion(
    categoryId: string,
    data: CreateUpdateQuestionDTO,
  ): Promise<QuestionWithAnswers> {
    const questionCandidate =
      await this.questionRepository.fetchByTextAndCategory(
        categoryId,
        data.text,
      );

    // Questions should have a unique text inside a category
    if (questionCandidate !== null) {
      throw new ConflictException('Question with provided text already exists');
    }

    this.checkAnswers(data.answers);

    // At this point, we can trust the upper application layer that the provided userId has access to categoryId
    return this.questionRepository.createQuestion(categoryId, data);
  }

  private checkAnswers(
    answers: CreateUpdateAnswerDTO[],
  ): CreateUpdateAnswerDTO[] {
    // The answer texts should not be identical
    if (this.answersHaveDuplicates(answers)) {
      throw new ConflictException("Answers don't have unique texts");
    }

    const correctAnswer = answers.filter((answer) => answer.isCorrect === true);

    // Enforce data integrity
    if (correctAnswer.length !== 1) {
      throw new ConflictException(
        'There must be always exactly one correct answer to the question',
      );
    }

    return answers;
  }

  private answersHaveDuplicates(answers: CreateUpdateAnswerDTO[]): boolean {
    const answerTexts = new Set<string>();

    return answers.some(
      (answer) =>
        answerTexts.size === answerTexts.add(answer.text.toLowerCase()).size,
    );
  }
}
