import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { CreatedGameWithPlayers } from '../Type/created-game-with-players';
import { GameState, Player } from '@prisma/client';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';
import { Game } from '@prisma/client';
import { GameWithPlayers } from '../Type/game-with-players';
import { UpdateGameInternalDTO } from '../DTO/update-game.internal.dto';
import { FinishedGameResult } from '../Type/finished-game-result';

@Injectable()
export class GameSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async fetchById(gameId: string): Promise<GameWithPlayers> {
    return this.prisma.game.findUnique({
      select: {
        id: true,
        startedById: true,
        state: true,
        startedAt: true,
        players: {
          orderBy: {
            order: 'asc',
          },
        },
        currentPlayerId: true,
        nextPlayerId: true,
      },
      where: {
        id: gameId,
      },
    });
  }

  async fetchForUser(userId: string): Promise<Game[]> {
    return this.prisma.game.findMany({
      where: {
        startedById: userId,
      },
    });
  }

  async endGame(gameId: string): Promise<FinishedGameResult> {
    return this.prisma.game.update({
      select: {
        id: true,
        state: true,
        players: true,
      },
      where: {
        id: gameId,
      },
      data: {
        state: GameState.FINISHED,
      },
    });
  }

  async updateGameDataAfterProgress(
    gameData: Game,
    answerer: Player,
  ): Promise<void> {
    await this.prisma.game.update({
      where: {
        id: gameData.id,
      },
      data: {
        currentPlayerId: gameData.currentPlayerId,
        nextPlayerId: gameData.nextPlayerId,
      },
    });

    await this.prisma.player.update({
      where: {
        id: answerer.id,
      },
      data: {
        points: answerer.points,
      },
    });
  }

  async createGame(
    startedBy: string,
    players: InitGameSessionPlayerDTO[],
  ): Promise<CreatedGameWithPlayers> {
    const createQuery = {
      data: {
        startedById: startedBy,
        state: GameState.IN_PROGRESS,
        players: {
          createMany: {
            data: [],
          },
        },
      },
      select: {
        id: true,
        startedById: true,
        state: true,
        startedAt: true,
        players: true,
      },
    };

    for (const player of players) {
      createQuery.data.players.createMany.data.push({
        name: player.name,
        order: player.order,
      });
    }

    return this.prisma.game.create(createQuery);
  }

  async updateGameFromInternalData(data: UpdateGameInternalDTO): Promise<Game> {
    return this.prisma.game.update({
      where: {
        id: data.gameId,
      },
      data: {
        currentPlayerId: data.currentPlayerId,
        nextPlayerId: data.nextPlayerId,
      },
    });
  }
}
