import { ConflictException, Injectable } from '@nestjs/common';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { CreatedGameWithPlayers } from '../Type/created-game-with-players';
import { PlayerTurns } from '../../Presentation/GameSession/Type/game-session-types';
import { ReorderService } from '../../Common/Service/reorder.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateGameSessionHandler {
  constructor(
    private readonly gameSessionRepository: GameSessionRepository,
    private readonly reorderService: ReorderService,
  ) {}

  async createGame(
    ownerId: string,
    players: InitGameSessionPlayerDTO[],
  ): Promise<CreatedGameWithPlayers> {
    this.preparePlayers(players);

    return this.gameSessionRepository.createGame(
      ownerId,
      players,
      this.determineInitPlayerTurns(players),
    );
  }

  private preparePlayers(players: InitGameSessionPlayerDTO[]): void {
    if (players.length < 1) {
      throw new ConflictException(
        'There must be at least one Player available to start a game',
      );
    }

    // We cannot rely on order of players here - this ensures that they're properly ordered
    players.sort((a, b) =>
      this.reorderService.reorderWithNull(a.order, b.order),
    );

    // Pre-generate IDs so turns can be determined
    players.map((player) => (player.id = uuidv4()));
  }

  private determineInitPlayerTurns(
    players: InitGameSessionPlayerDTO[],
  ): PlayerTurns {
    // If there is only one player, it'll be looped indefinitely
    if (players.length < 2) {
      return { currentPlayerId: players[0].id, nextPlayerId: players[0].id };
    }

    return { currentPlayerId: players[0].id, nextPlayerId: players[1].id };
  }
}
