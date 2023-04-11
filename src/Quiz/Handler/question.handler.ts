import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUpdateQuestionDTO } from '../DTO/create-update-question.dto';
import { QuestionRepository } from '../Repository/question.repository';
import { CreateUpdateAnswerDTO } from '../DTO/create-update-answer.dto';
import { ObjectID } from 'bson';
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

    if (data.answers !== undefined) {
      this.prepareQuestionAnswers(data.answers);

      data.correctAnswer = this.getCorrectAnswerFromList(data.answers).id;
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

    // At this point, we can trust the upper application layer that the provided userId has access to categoryId
    if (data.answers !== undefined) {
      this.prepareQuestionAnswers(data.answers);

      data.correctAnswer = this.getCorrectAnswerFromList(data.answers).id;
    }

    return this.questionRepository.createQuestion(categoryId, data);
  }

  private prepareQuestionAnswers(
    answers: CreateUpdateAnswerDTO[],
  ): CreateUpdateAnswerDTO[] {
    // We need to sort answers by order, if present
    answers = answers.sort((a, b) => a.order - b.order);

    // The answer texts should not be identical
    if (this.answersHaveDuplicates(answers)) {
      throw new ConflictException("Answers don't have unique texts");
    }

    // We don't want to use the data here, however, we want to ensure that there's only one correct answer
    this.getCorrectAnswerFromList(answers);

    // Generate object IDs, so we can later determine the correct answer
    answers.map((answer) => (answer.id = new ObjectID().toString()));

    return answers;
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

    return correctAnswer[0];
  }

  private answersHaveDuplicates(answers: CreateUpdateAnswerDTO[]): boolean {
    const answerTexts = new Set<string>();

    return answers.some(
      (answer) =>
        answerTexts.size === answerTexts.add(answer.text.toLowerCase()).size,
    );
  }
}
