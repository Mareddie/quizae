import {
  Body,
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

@Controller('game-session')
@UseGuards(AuthenticatedGuard)
export class GameSessionController {
  constructor(
    private readonly createHandler: CreateGameSessionHandler,
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    private readonly progressGameHandler: ProgressGameSessionHandler,
    private readonly gameQuestionFacade: GameFacade,
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
  async getGameStatus(@Param('gameId') gameId: string): Promise<void> {
    // TODO: reimplement game logic
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
  ): Promise<void> {
    // TODO: reimplement fetch of game question
    return await this.gameQuestionFacade.getQuestionForGame(gameId, categoryId);
  }

  @Post(':gameId/progress')
  @UseGuards(new CheckUuidGuard('gameId'), CanAccessGameGuard)
  async progressGame(
    @Param('gameId') gameId: string,
    @Body() progressGameData: ProgressGameRequestDTO,
  ): Promise<void> {
    // TODO: reimplement progress logic
    return await this.progressGameHandler.progressGame(
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
