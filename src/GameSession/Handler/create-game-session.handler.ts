import { ConflictException, Injectable } from '@nestjs/common';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { CreatedGameWithPlayers } from '../Type/created-game-with-players';
import {
  GameQuestionCategory,
  GameQuestion,
  GameQuestionAnswer,
} from '@prisma/client';
import { CategoriesWithQuestionsAndAnswers } from '../../Quiz/Type/categories-with-questions-and-answers';
import { QuestionWithAnswers } from '../../Quiz/Type/question-with-answers';

@Injectable()
export class CreateGameSessionHandler {
  constructor(private readonly gameSessionRepository: GameSessionRepository) {}

  async createGame(
    ownerId: string,
    categoriesWithQuestions: CategoriesWithQuestionsAndAnswers[],
    players: InitGameSessionPlayerDTO[],
  ): Promise<CreatedGameWithPlayers> {
    if (categoriesWithQuestions.length === 0) {
      throw new ConflictException(
        'Cannot start a game without any question categories',
      );
    }

    // Ensure that the order of players is correct
    players.sort((a, b) => this.reorderWithNull(a.order, b.order));

    // Ensure that the order of categories, questions and answers is correct
    this.sortGameData(categoriesWithQuestions);

    return this.gameSessionRepository.createGame(
      ownerId,
      this.prepareGameData(categoriesWithQuestions),
      players,
    );
  }

  private prepareGameData(
    categoriesWithQuestions: CategoriesWithQuestionsAndAnswers[],
  ): GameQuestionCategory[] {
    const preparedCategories: GameQuestionCategory[] = [];

    for (const categoryWithQuestion of categoriesWithQuestions) {
      // We can skip empty categories
      if (categoryWithQuestion.questions.length === 0) {
        continue;
      }

      preparedCategories.push({
        id: categoryWithQuestion.id,
        name: categoryWithQuestion.name,
        questions: this.prepareGameQuestions(categoryWithQuestion.questions),
        order: categoryWithQuestion.order,
      });
    }

    return preparedCategories;
  }

  private prepareGameQuestions(
    questions: QuestionWithAnswers[],
  ): GameQuestion[] {
    const preparedQuestions: GameQuestion[] = [];

    for (const question of questions) {
      if (this.isQuestionValidForGame(question) === false) {
        continue;
      }

      preparedQuestions.push({
        id: question.id,
        categoryId: question.categoryId,
        text: question.text,
        correctAnswer: question.correctAnswer,
        answers: this.prepareAnswersForQuestion(question),
      });
    }

    return preparedQuestions;
  }

  private prepareAnswersForQuestion(
    question: QuestionWithAnswers,
  ): GameQuestionAnswer[] {
    const preparedAnswers: GameQuestionAnswer[] = [];

    for (const answer of question.answers) {
      preparedAnswers.push({
        id: answer.id,
        questionId: answer.questionId,
        text: answer.text,
        order: answer.order,
      });
    }

    return preparedAnswers;
  }

  private isQuestionValidForGame(question: QuestionWithAnswers): boolean {
    if (
      question.correctAnswer === null ||
      question.correctAnswer === undefined ||
      question.correctAnswer === ''
    ) {
      return false;
    }

    // The Question is valid only if it has EXACTLY ONE correct answer
    if (question.answers.length === 0) {
      return false;
    }

    return (
      question.answers.filter((answer) => answer.id === question.correctAnswer)
        .length === 1
    );
  }

  private sortGameData(
    categoriesWithQuestions: CategoriesWithQuestionsAndAnswers[],
  ): void {
    categoriesWithQuestions.sort((a, b) =>
      this.reorderWithNull(a.order, b.order),
    );

    for (const categoryWithQuestion of categoriesWithQuestions) {
      for (const question of categoryWithQuestion.questions) {
        question.answers.sort((a, b) => this.reorderWithNull(a.order, b.order));
      }
    }
  }

  private reorderWithNull(a: null | number, b: null | number): number {
    if (a === null || b === null) {
      return -1;
    }

    return a - b;
  }
}
