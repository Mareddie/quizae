import { ConflictException, Injectable } from '@nestjs/common';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { GameWithPlayers } from '../Type/game-with-players';

@Injectable()
export class CreateGameSessionHandler {
  constructor(private readonly gameSessionRepository: GameSessionRepository) {}

  async createGame(
    ownerId: string,
    questionCategoryIds: string[],
    players: InitGameSessionPlayerDTO[],
  ): Promise<GameWithPlayers> {
    if (questionCategoryIds.length === 0) {
      throw new ConflictException(
        'Cannot start game with no questions to play with.',
      );
    }

    return this.gameSessionRepository.createGame(
      ownerId,
      questionCategoryIds,
      players,
    );
  }
}
