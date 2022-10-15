import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CheckObjectIdGuard } from '../../../Common/Guard/check-object-id.guard';
import { AuthenticatedGuard } from '../../../Auth/Guard/authenticated.guard';
import { CanAccessGroupGuard } from '../../../Common/Guard/can-access-group.guard';
import { CheckOriginGuard } from '../../../Common/Guard/check-origin.guard';
import { CreateGameSessionRequestDTO } from '../../../GameSession/DTO/create-game-session-request.dto';
import { CreateGameSessionHandler } from '../../../GameSession/Handler/create-game-session.handler';
import { Request } from 'express';
import { QuestionCategoryRepository } from '../../../Quiz/Repository/question-category.repository';
import { GameWithPlayers } from '../../../GameSession/Type/game-with-players';

@Controller('/game-session/:groupId')
@UseGuards(
  new CheckObjectIdGuard('groupId'),
  AuthenticatedGuard,
  CanAccessGroupGuard,
)
export class GameSessionController {
  constructor(
    private readonly createHandler: CreateGameSessionHandler,
    private readonly questionCategoryRepository: QuestionCategoryRepository,
  ) {}

  @Post('create')
  @UseGuards(CheckOriginGuard)
  async createGame(
    @Req() request: Request,
    @Param('groupId') groupId: string,
    @Body() createGameSession: CreateGameSessionRequestDTO,
  ): Promise<GameWithPlayers> {
    const questionCategories =
      await this.questionCategoryRepository.fetchForGroup(groupId);

    return await this.createHandler.createGame(
      request.user['id'],
      questionCategories.map((questionCategory) => questionCategory.id),
      createGameSession.players,
    );
  }
}
