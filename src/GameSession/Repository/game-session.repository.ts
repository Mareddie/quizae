import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Common/Service/prisma.service';
import { GameWithPlayers } from '../Type/game-with-players';

@Injectable()
export class GameSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createGame(
    startedBy: string,
    questionCategoryIds: string[],
    players,
  ): Promise<GameWithPlayers> {
    const createQuery = {
      data: {
        startedById: startedBy,
        questionCategoryIds: questionCategoryIds,
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
      createQuery.data.players.createMany.data.push({ name: player.name });
    }

    return this.prisma.game.create(createQuery);
  }
}
