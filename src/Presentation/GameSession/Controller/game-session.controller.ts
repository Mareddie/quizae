import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CanAccessGroupGuard } from '../../../Common/Guard/can-access-group.guard';
import { CreateGameSessionRequestDTO } from '../../../GameSession/DTO/create-game-session-request.dto';
import { CreateGameSessionHandler } from '../../../GameSession/Handler/create-game-session.handler';
import { Request } from 'express';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { CreatedGameWithPlayers } from '../../../GameSession/Type/created-game-with-players';
import { CanAccessGameGuard } from '../Guard/can-access-game.guard';
import { GameStatusFacade } from '../../../GameSession/Facade/game-status.facade';
import { GameStatus } from '../../../GameSession/Type/game-status';
import { ProgressGameRequestDTO } from '../../../GameSession/DTO/progress-game-request.dto';
import { GameQuestionFacade } from '../../../GameSession/Facade/game-question.facade';
import { QuestionForGame } from '../../../GameSession/Type/question-for-game';
import { ProgressGameSessionHandler } from '../../../GameSession/Handler/progress-game-session.handler';
import { GameProgressResult } from '../../../GameSession/Type/game-progress-result';
import { FinishedGameResult } from '../../../GameSession/Type/finished-game-result';

@Controller('game-session')
@UseGuards(AuthenticatedGuard)
export class GameSessionController {
  constructor(
    private readonly createHandler: CreateGameSessionHandler,
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    private readonly progressGameHandler: ProgressGameSessionHandler,
    private readonly statusFacade: GameStatusFacade,
    private readonly gameQuestionFacade: GameQuestionFacade,
  ) {}

  @Post(':groupId/create')
  @UseGuards(new CheckObjectIdGuard('groupId'), CanAccessGroupGuard)
  async createGame(
    @Req() request: Request,
    @Param('groupId') groupId: string,
    @Body() createGameSession: CreateGameSessionRequestDTO,
  ): Promise<CreatedGameWithPlayers> {
    const questionCategories =
      await this.questionCategoryRepository.fetchForGame(groupId);

    return await this.createHandler.createGame(
      request.user['id'],
      questionCategories,
      createGameSession.players,
    );
  }

  @Get(':gameId')
  @UseGuards(new CheckObjectIdGuard('gameId'), CanAccessGameGuard)
  async getGameStatus(@Param('gameId') gameId: string): Promise<GameStatus> {
    return this.statusFacade.getGameStatus(gameId);
  }

  @Get(':gameId/get-question/:categoryId')
  @UseGuards(
    new CheckObjectIdGuard('gameId'),
    new CheckObjectIdGuard('categoryId'),
    CanAccessGameGuard,
  )
  async getGameQuestion(
    @Param('gameId') gameId: string,
    @Param('categoryId') categoryId: string,
  ): Promise<QuestionForGame> {
    return await this.gameQuestionFacade.getQuestionForGame(gameId, categoryId);
  }

  @Post(':gameId/progress')
  @UseGuards(new CheckObjectIdGuard('gameId'), CanAccessGameGuard)
  async progressGame(
    @Param('gameId') gameId: string,
    @Body() progressGameData: ProgressGameRequestDTO,
  ): Promise<GameProgressResult> {
    return await this.progressGameHandler.progressGame(
      progressGameData,
      gameId,
    );
  }

  @Post(':gameId/finish')
  @UseGuards(new CheckObjectIdGuard('gameId'), CanAccessGameGuard)
  async finishGame(
    @Param('gameId') gameId: string,
  ): Promise<FinishedGameResult> {
    return await this.progressGameHandler.endGame(gameId);
  }
}
