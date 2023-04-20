import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUpdateQuestionDTO } from '../DTO/create-update-question.dto';
import { QuestionRepository } from '../Repository/question.repository';
import { CreateUpdateAnswerDTO } from '../DTO/create-update-answer.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  PreparedQuestionAnswers,
  QuestionWithAnswers,
} from '../Type/question-with-answers';

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

    if (data.answers !== undefined) {
      this.prepareQuestionAnswers(data.answers);

      // TODO correct answer processing
      // data.correctAnswer = this.getCorrectAnswerFromList(data.answers).id;
    }

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

    // New questions must have answers specified
    if (data.answers === undefined) {
      throw new BadRequestException(
        'Answers must be provided with new question',
      );
    }

    // At this point, we can trust the upper application layer that the provided userId has access to categoryId
    const preparedAnswers = this.prepareQuestionAnswers(data.answers);

    data.correctAnswer = preparedAnswers.correctAnswer;
    data.answers = preparedAnswers.answers;

    return this.questionRepository.createQuestion(categoryId, data);
  }

  private prepareQuestionAnswers(
    answers: CreateUpdateAnswerDTO[],
  ): PreparedQuestionAnswers {
    // The answer texts should not be identical
    if (this.answersHaveDuplicates(answers)) {
      throw new ConflictException("Answers don't have unique texts");
    }
    // Generate object IDs, so we can later determine the correct answer
    answers.map((answer) => (answer.id = uuidv4()));

    const correctAnswer = this.getCorrectAnswerFromList(answers);

    return {
      correctAnswer: correctAnswer,
      answers: answers.filter((answer) => answer.id !== correctAnswer.id),
    };
  }

  private getCorrectAnswerFromList(
    answers: CreateUpdateAnswerDTO[],
  ): CreateUpdateAnswerDTO {
    const correctAnswer = answers.filter(
      (answer) => answer.isCorrectAnswer === true,
    );

    // Enforce the validity of correct answer
    if (correctAnswer.length !== 1) {
      throw new ConflictException(
        'There must be always exactly one correct answer to the question',
      );
    }

    const foundCorrectAnswer = correctAnswer[0];

    delete foundCorrectAnswer.isCorrectAnswer;

    return foundCorrectAnswer;
  }

  private answersHaveDuplicates(answers: CreateUpdateAnswerDTO[]): boolean {
    const answerTexts = new Set<string>();

    return answers.some(
      (answer) =>
        answerTexts.size === answerTexts.add(answer.text.toLowerCase()).size,
    );
  }
}
