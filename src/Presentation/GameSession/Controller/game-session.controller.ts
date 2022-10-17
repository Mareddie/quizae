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
import { CheckOriginGuard } from '../../../Common/Guard/check-origin.guard';
import { CreateGameSessionRequestDTO } from '../../../GameSession/DTO/create-game-session-request.dto';
import { CreateGameSessionHandler } from '../../../GameSession/Handler/create-game-session.handler';
import { Request } from 'express';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { CreatedGameWithPlayers } from '../../../GameSession/Type/created-game-with-players';
import { CanAccessGameGuard } from '../Guard/can-access-game.guard';
import { GameStatusFacade } from '../../../GameSession/Facade/game-status.facade';
import { GameStatus } from '../../../GameSession/Type/game-status';

@Controller('game-session')
@UseGuards(AuthenticatedGuard)
export class GameSessionController {
  constructor(
    private readonly createHandler: CreateGameSessionHandler,
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    private readonly statusFacade: GameStatusFacade,
  ) {}

  @Post(':groupId/create')
  @UseGuards(
    new CheckObjectIdGuard('groupId'),
    CanAccessGroupGuard,
    CheckOriginGuard,
  )
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

  // TODO: Endpoint for progressing the game
  // TODO: Endpoint for concluding the game
}
