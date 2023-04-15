import { BadRequestException, Injectable } from '@nestjs/common';
import { GameSessionRepository } from '../../../GameSession/Repository/game-session.repository';
import { GameState } from '@prisma/client';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { GameInfo } from '../Type/game-session-types';

@Injectable()
export class GameFacade {
  constructor(
    private readonly gameRepository: GameSessionRepository,
    private readonly questionCategoryRepository: QuestionCategoryRepository,
  ) {}

  async getGameData(gameId: string): Promise<GameInfo> {
    // TODO after having implemented scoring and answering, show count without answered questions
    const gameData = await this.gameRepository.fetchById(gameId);

    if (gameData.state === GameState.FINISHED) {
      return {
        info: gameData,
      };
    }

    const questionsAndAnswers =
      await this.questionCategoryRepository.getForGame(gameData.startedById);

    return {
      info: gameData,
      categories: questionsAndAnswers,
    };
  }

  async getQuestionForGame(gameId: string, categoryId: string): Promise<void> {
    const gameData = await this.gameRepository.fetchById(gameId);

    if (gameData.state === GameState.FINISHED) {
      throw new BadRequestException(
        'Cannot fetch a question for finished game.',
      );
    }

    // const filteredCategory = gameData.questionCategories.find(
    //   (questionCategory) => questionCategory.id === categoryId,
    // );
    //
    // if (filteredCategory === undefined) {
    //   throw new BadRequestException('Category was not found in the game');
    // }
    //
    // const randomQuestionFromCategory =
    //   filteredCategory.questions[
    //     Math.floor(Math.random() * filteredCategory.questions.length)
    //   ];
    //
    // delete randomQuestionFromCategory.correctAnswer;
    //
    // return randomQuestionFromCategory;
  }
}
