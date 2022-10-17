import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { CreatedGameWithPlayers } from '../Type/created-game-with-players';
import { GameQuestionCategory, GameState } from '@prisma/client';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';
import { Game } from '@prisma/client';
import { GameWithPlayers } from '../Type/game-with-players';
import { UpdateGameInternalDTO } from '../DTO/update-game.internal.dto';

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
        players: true,
        questionCategories: true,
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

  async createGame(
    startedBy: string,
    gameData: GameQuestionCategory[],
    players: InitGameSessionPlayerDTO[],
  ): Promise<CreatedGameWithPlayers> {
    const createQuery = {
      data: {
        startedById: startedBy,
        state: GameState.IN_PROGRESS,
        questionCategories: gameData,
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
