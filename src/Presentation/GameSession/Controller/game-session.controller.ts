import {
  Body,
  ConflictException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CheckUuidGuard } from '../../../Common/Guard/check-uuid.guard';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CreateGameSessionRequestDTO } from '../../../GameSession/DTO/create-game-session-request.dto';
import { CreateGameSessionHandler } from '../../../GameSession/Handler/create-game-session.handler';
import { Request } from 'express';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { CreatedGameWithPlayers } from '../../../GameSession/Type/created-game-with-players';
import { CanAccessGameGuard } from '../Guard/can-access-game.guard';
import { ProgressGameRequestDTO } from '../../../GameSession/DTO/progress-game-request.dto';
import { ProgressGameSessionHandler } from '../../../GameSession/Handler/progress-game-session.handler';
import { FinishedGameResult } from '../../../GameSession/Type/finished-game-result';
import { GameFacade } from '../Facade/game.facade';
import { GameInfo } from '../Type/game-session-types';
import { QuestionCandidateForGame } from '../../../Quiz/Type/question-with-answers';
import { QuestionRepository } from '../../../Quiz/Repository/question.repository';

@Controller('game-session')
@UseGuards(AuthenticatedGuard)
export class GameSessionController {
  constructor(
    private readonly createHandler: CreateGameSessionHandler,
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly progressGameHandler: ProgressGameSessionHandler,
    private readonly gameFacade: GameFacade,
  ) {}

  @Post('/create')
  async createGame(
    @Req() request: Request,
    @Body() createGameSession: CreateGameSessionRequestDTO,
  ): Promise<CreatedGameWithPlayers> {
    return await this.createHandler.createGame(
      request.user['id'],
      createGameSession.players,
    );
  }

  @Get(':gameId')
  @UseGuards(new CheckUuidGuard('gameId'), CanAccessGameGuard)
  async getGameStatus(@Param('gameId') gameId: string): Promise<GameInfo> {
    return await this.gameFacade.getGameData(gameId);
  }

  @Get(':gameId/get-question/:categoryId')
  @UseGuards(
    new CheckUuidGuard('gameId'),
    new CheckUuidGuard('categoryId'),
    CanAccessGameGuard,
  )
  async getGameQuestion(
    @Param('gameId') gameId: string,
    @Param('categoryId') categoryId: string,
  ): Promise<QuestionCandidateForGame> {
    return await this.gameFacade.getQuestionForGame(gameId, categoryId);
  }

  @Post(':gameId/progress')
  @UseGuards(new CheckUuidGuard('gameId'), CanAccessGameGuard)
  async progressGame(
    @Param('gameId') gameId: string,
    @Body() progressGameData: ProgressGameRequestDTO,
    @Req() req: Request,
  ): Promise<void> {
    // TODO: reimplement progress logic

    // We already are sure that the User can access game because of the guard check
    const questionData = await this.questionRepository.fetchForGameProgress(
      progressGameData.questionId,
      gameId,
      req.user['id'],
    );

    if (!questionData) {
      throw new ConflictException(
        'Question could not be found or has been already answered',
      );
    }

    return await this.progressGameHandler.progressGame(
      questionData,
      progressGameData,
      gameId,
    );
  }

  @Post(':gameId/finish')
  @UseGuards(new CheckUuidGuard('gameId'), CanAccessGameGuard)
  async finishGame(
    @Param('gameId') gameId: string,
  ): Promise<FinishedGameResult> {
    return await this.progressGameHandler.endGame(gameId);
  }
}
