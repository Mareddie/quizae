import { Injectable } from '@nestjs/common';
import { GameSessionRepository } from '../Repository/game-session.repository';
import { GameWithPlayers } from '../Type/game-with-players';
import { ReorderService } from '../../Common/Service/reorder.service';
import { CategoryStatus, GameStatus } from '../Type/game-status';

@Injectable()
export class GameStatusFacade {
  constructor(
    private readonly gameRepository: GameSessionRepository,
    private readonly reorderService: ReorderService,
  ) {}

  async getGameStatus(gameId: string): Promise<GameStatus> {
    const gameData = await this.gameRepository.fetchById(gameId);

    await this.preparePlayers(gameData);

    return {
      id: gameData.id,
      startedById: gameData.startedById,
      state: gameData.state,
      currentPlayerId: gameData.currentPlayerId,
      nextPlayerId: gameData.nextPlayerId,
      players: gameData.players,
      categoryStatuses: this.aggregateGameData(gameData),
      startedAt: gameData.startedAt,
    };
  }

  private aggregateGameData(gameData: GameWithPlayers): CategoryStatus[] {
    // We don't want to expose questions with answers directly, but we want to send information about what can be played
    return gameData.questionCategories
      .filter((questionCategory) => questionCategory.questions.length > 0)
      .sort((a, b) => this.reorderService.reorderWithNull(a.order, b.order))
      .map((questionCategory) => {
        return {
          id: questionCategory.id,
          name: questionCategory.name,
          order: questionCategory.order,
          questionCount: questionCategory.questions.length,
        } as CategoryStatus;
      });
  }

  private async preparePlayers(gameData: GameWithPlayers): Promise<void> {
    gameData.players.sort((a, b) =>
      this.reorderService.reorderWithNull(a.order, b.order),
    );

    if (gameData.currentPlayerId !== null && gameData.nextPlayerId !== null) {
      return;
    }

    // One without the other produces invalid game state. If such happens, it resets to the first player.
    const { currentPlayerId, nextPlayerId } =
      this.determinePlayersForGame(gameData);

    gameData.currentPlayerId = currentPlayerId;
    gameData.nextPlayerId = nextPlayerId;

    await this.gameRepository.updateGameFromInternalData({
      gameId: gameData.id,
      currentPlayerId: gameData.currentPlayerId,
      nextPlayerId: gameData.nextPlayerId,
    });
  }

  private determinePlayersForGame(gameData: GameWithPlayers): {
    currentPlayerId: string;
    nextPlayerId: string;
  } {
    // There can be only one Player - in that case he'll play every round
    if (gameData.players.length === 1) {
      return {
        currentPlayerId: gameData.players[0].id,
        nextPlayerId: gameData.players[0].id,
      };
    }

    return {
      currentPlayerId: gameData.players[0].id,
      nextPlayerId: gameData.players[1].id,
    };
  }
}
