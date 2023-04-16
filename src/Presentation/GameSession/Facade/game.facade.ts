import { BadRequestException, Injectable } from '@nestjs/common';
import { GameSessionRepository } from '../../../GameSession/Repository/game-session.repository';
import { GameState } from '@prisma/client';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { GameInfo } from '../Type/game-session-types';
import { QuestionRepository } from '../../../Quiz/Repository/question.repository';
import { QuestionCandidateForGame } from '../../../Quiz/Type/question-with-answers';

@Injectable()
export class GameFacade {
  constructor(
    private readonly gameRepository: GameSessionRepository,
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    private readonly questionRepository: QuestionRepository,
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

  async getQuestionForGame(
    gameId: string,
    categoryId: string,
  ): Promise<QuestionCandidateForGame> {
    const gameData = await this.gameRepository.fetchById(gameId);

    if (gameData.state === GameState.FINISHED) {
      throw new BadRequestException(
        'Cannot fetch a question for finished game.',
      );
    }

    const questionCandidates =
      await this.questionRepository.fetchCandidatesForGame(categoryId, gameId);

    if (questionCandidates.length === 0) {
      throw new BadRequestException(
        'There are no available questions for this category anymore.',
      );
    }

    if (questionCandidates.length === 1) {
      return questionCandidates[0];
    }

    return questionCandidates[
      Math.floor(Math.random() * questionCandidates.length)
    ];
  }
}
