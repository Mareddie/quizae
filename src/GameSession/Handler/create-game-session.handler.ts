import { Injectable } from '@nestjs/common';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { CreatedGameWithPlayers } from '../Type/created-game-with-players';

@Injectable()
export class CreateGameSessionHandler {
  constructor(private readonly gameSessionRepository: GameSessionRepository) {}

  async createGame(
    ownerId: string,
    players: InitGameSessionPlayerDTO[],
  ): Promise<CreatedGameWithPlayers> {
    return this.gameSessionRepository.createGame(ownerId, players);
  }
}
