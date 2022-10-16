import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { GameWithPlayers } from '../Type/game-with-players';
import { GameState } from '@prisma/client';
import { InitGameSessionPlayerDTO } from '../DTO/create-game-session-request.dto';

@Injectable()
export class GameSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createGame(
    startedBy: string,
    questionCategoryIds: string[],
    players: InitGameSessionPlayerDTO[],
  ): Promise<GameWithPlayers> {
    const createQuery = {
      data: {
        startedById: startedBy,
        questionCategoryIds: questionCategoryIds,
        state: GameState.IN_PROGRESS,
        players: {
          createMany: {
            data: [],
          },
        },
      },
      include: {
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
}
