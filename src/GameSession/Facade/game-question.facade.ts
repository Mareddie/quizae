import { BadRequestException, Injectable } from '@nestjs/common';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { GameQuestion, GameState } from '@prisma/client';
import { QuestionForGame } from '../Type/question-for-game';

@Injectable()
export class GameQuestionFacade {
  constructor(private readonly gameRepository: GameSessionRepository) {}

  async getQuestionForGame(
    gameId: string,
    categoryId: string,
  ): Promise<QuestionForGame> {
    const gameData = await this.gameRepository.fetchById(gameId);

    if (gameData.state === GameState.FINISHED) {
      throw new BadRequestException(
        'Cannot fetch a question for finished game.',
      );
    }

    const filteredCategory = gameData.questionCategories.find(
      (questionCategory) => questionCategory.id === categoryId,
    );

    if (filteredCategory === undefined) {
      throw new BadRequestException('Category was not found in the game');
    }

    const randomQuestionFromCategory: GameQuestion =
      filteredCategory.questions[
        Math.floor(Math.random() * filteredCategory.questions.length)
      ];

    delete randomQuestionFromCategory.correctAnswer;

    return randomQuestionFromCategory;
  }
}
